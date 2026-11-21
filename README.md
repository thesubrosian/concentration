# Concentration

An offline Android version of the original color-matching memory game. The default board has 24 squares and 12 pairs. Mismatched squares stay visible for one second.

## Scoring

A match attempt consists of two flips. Successful matches always add zero memory lapses. After a mismatch, each of these choices adds one lapse based on which locations the player had exposed at the time of the flip.

- On the first flip, passing up a known pair or reopening a square whose partner has yet to be revealed. A pair is known when both of its unmatched locations have been revealed before.
- On the second flip, passing up the open square's known partner or reopening a previously seen square when the partner is still unknown.

Two fresh flips that miss while an unrelated known pair is available add one lapse for the first flip. A missed opportunity to match the open square can add a second lapse.

## Android build

The APK targets Android 15 and supports Android 8.0 and later. [Download the signed Android installer](https://github.com/thesubrosian/concentration/raw/refs/heads/main/downloads/Concentration.apk).

To build from source, use Java, Eclipse ECJ, Android SDK Platform 35, and Android SDK Build Tools 35.0.1. Run the build script from this directory with the paths to your installed tools.

```sh
CONCENTRATION_ANDROID_BUILD_TOOLS=/path/to/android-sdk/build-tools/35.0.1 \
CONCENTRATION_ANDROID_PLATFORM_JAR=/path/to/android-sdk/platforms/android-35/android.jar \
CONCENTRATION_ECJ_JAR=/path/to/ecj.jar \
./build-apk.sh
```

The script produces `build/Concentration.apk`. Its default signing key and password file are generated in `../concentration-signing`. To build an update, use the same signing key as the APK already installed. To use an existing key, specify `CONCENTRATION_KEYSTORE`, `CONCENTRATION_SIGNING_PASSWORD_FILE`, and `CONCENTRATION_SIGNING_ALIAS`.

Run the scoring tests with `node --test tests/concentration.test.cjs`.
