#!/usr/bin/env bash
set -euo pipefail
umask 077

project_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
sdk_dir="$project_dir/../android-tools"
build_tools=${CONCENTRATION_ANDROID_BUILD_TOOLS:-"$sdk_dir/android-15"}
platform=${CONCENTRATION_ANDROID_PLATFORM_JAR:-"$sdk_dir/android-35/android.jar"}
compiler=${CONCENTRATION_ECJ_JAR:-"$sdk_dir/ecj.jar"}
output=${CONCENTRATION_APK_OUTPUT:-"$project_dir/build/Concentration.apk"}

signing_dir="$project_dir/../concentration-signing"
keystore=${CONCENTRATION_KEYSTORE:-"$signing_dir/concentration.p12"}
password_file=${CONCENTRATION_SIGNING_PASSWORD_FILE:-"$signing_dir/password"}
alias=${CONCENTRATION_SIGNING_ALIAS:-concentration}

for asset in index.html game.js screen.js; do
    if [[ ! -s "$project_dir/assets/$asset" ]]; then
        printf 'Required game asset is missing: %s\n' "$project_dir/assets/$asset" >&2
        exit 1
    fi
done

if [[ -z ${CONCENTRATION_KEYSTORE:-} ]]; then
    mkdir -p -- "$signing_dir"
    (
        flock 9
        if [[ ! -f "$keystore" ]]; then
            if [[ ! -f "$password_file" && -z ${CONCENTRATION_SIGNING_PASSWORD_FILE:-} ]]; then
                openssl rand -hex 32 > "$password_file"
            fi
            keytool -genkeypair -keystore "$keystore" -storetype PKCS12 \
                -storepass:file "$password_file" -alias "$alias" -keyalg RSA -keysize 3072 \
                -validity 10000 -dname "CN=Concentration"
        fi
    ) 9>"$signing_dir/generate.lock"
fi

mkdir -p -- "$project_dir/build" "$(dirname -- "$output")"
build_dir=$(mktemp -d "$project_dir/build/apk.XXXXXXXX")
trap 'rm -rf -- "$build_dir"' EXIT
mkdir -- "$build_dir/classes" "$build_dir/dex" "$build_dir/generated"

"$build_tools/aapt2" compile --dir "$project_dir/res" -o "$build_dir/resources.zip"
"$build_tools/aapt2" link -I "$platform" --manifest "$project_dir/AndroidManifest.xml" \
    --java "$build_dir/generated" -A "$project_dir/assets" \
    -o "$build_dir/unsigned.apk" "$build_dir/resources.zip"

package_path=com/thesubrosian/concentration
java -jar "$compiler" -8 -proc:none -classpath "$platform" -d "$build_dir/classes" \
    "$project_dir/src/$package_path/MainActivity.java" "$build_dir/generated/$package_path/R.java"
"$build_tools/d8" --lib "$platform" --min-api 26 --output "$build_dir/dex" \
    "$build_dir/classes/$package_path/"*.class
touch -t 198001010000 "$build_dir/dex/classes.dex"
(cd -- "$build_dir/dex" && zip -q -X "$build_dir/unsigned.apk" classes.dex)

"$build_tools/zipalign" -f 4 "$build_dir/unsigned.apk" "$build_dir/aligned.apk"
"$build_tools/apksigner" sign --ks "$keystore" --ks-key-alias "$alias" \
    --ks-pass "file:$password_file" --v4-signing-enabled false \
    --out "$build_dir/signed.apk" "$build_dir/aligned.apk"
"$build_tools/zipalign" -c 4 "$build_dir/signed.apk"
"$build_tools/apksigner" verify --verbose "$build_dir/signed.apk"
mv -f -- "$build_dir/signed.apk" "$output"
printf '%s\n' "$output"
