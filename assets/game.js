"use strict";

function createGame(colors) {
  const tiles = colors.map(color => ({ color, seen: false, faceUp: false, matched: false }));
  let firstTile = null;
  let secondTile = null;
  let firstFlipWasLapse = false;
  let attempts = 0;
  let lapses = 0;
  let matchedTiles = 0;

  function knownMate(tile) {
    return tiles.find(other => other !== tile && other.seen && !other.matched && other.color === tile.color);
  }

  function flip(index) {
    const tile = tiles[index];
    if (!tile || tile.faceUp || secondTile) return false;

    if (!firstTile) {
      // Remember the information available before the reveal. Score only if the pair misses.
      firstFlipWasLapse = tile.seen
        ? !knownMate(tile)
        : tiles.some(other => other.seen && !other.matched && knownMate(other));
      firstTile = tile;
    } else {
      attempts++;
      if (tile.color === firstTile.color) {
        firstTile.matched = true;
        tile.matched = true;
        matchedTiles += 2;
        firstTile = null;
      } else {
        if (firstFlipWasLapse) lapses++;
        if (tile.seen || knownMate(firstTile)) lapses++;
        secondTile = tile;
      }
    }
    tile.seen = true;
    tile.faceUp = true;
    return true;
  }

  function hideMismatch() {
    if (!secondTile) return;
    firstTile.faceUp = false;
    secondTile.faceUp = false;
    firstTile = null;
    secondTile = null;
  }

  return {
    tiles,
    flip,
    hideMismatch,
    get attempts() { return attempts; },
    get lapses() { return lapses; },
    get mismatch() { return secondTile !== null; },
    get complete() { return matchedTiles === tiles.length; }
  };
}

if (typeof module === "object" && module.exports) module.exports = { createGame };
