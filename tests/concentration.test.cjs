const assert = require('node:assert/strict');
const test = require('node:test');
const { createGame } = require('../assets/game.js');

function flipPair(game, first, second) {
  assert.equal(game.flip(first), true);
  assert.equal(game.flip(second), true);
}

test('exploring fresh tiles and finding a known mate earn zero lapses', () => {
  const game = createGame(['blue', 'red', 'blue', 'red']);

  flipPair(game, 0, 1);
  assert.equal(game.attempts, 1);
  assert.equal(game.lapses, 0);
  game.hideMismatch();
  assert.equal(game.tiles[0].seen, true);
  assert.equal(game.tiles[0].faceUp, false);
  assert.equal(game.tiles[2].seen, false);

  flipPair(game, 2, 0);
  assert.equal(game.attempts, 2);
  assert.equal(game.lapses, 0);
  assert.equal(game.tiles[0].matched, true);
  assert.equal(game.tiles[2].matched, true);
  assert.equal(game.complete, false);

  flipPair(game, 3, 1);
  assert.equal(game.attempts, 3);
  assert.equal(game.lapses, 0);
  assert.equal(game.complete, true);
});

test('ignoring the open tile’s known mate is a lapse even when exploring', () => {
  const game = createGame(['blue', 'red', 'blue', 'green', 'red', 'green']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  assert.equal(game.flip(2), true);
  assert.equal(game.lapses, 0);
  assert.equal(game.flip(3), true);
  assert.equal(game.lapses, 1);
  game.hideMismatch();

  flipPair(game, 0, 2);
  assert.equal(game.lapses, 1);
});

test('a successful match earns zero lapses even when another pair was already known', () => {
  const game = createGame(['blue', 'red', 'blue', 'green', 'red', 'green']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  flipPair(game, 2, 3);
  game.hideMismatch();
  assert.equal(game.lapses, 1);

  flipPair(game, 4, 1);
  assert.equal(game.lapses, 1);
  assert.equal(game.tiles[0].matched, false);
  assert.equal(game.tiles[2].matched, false);
});

test('skipping an available pair for two fresh mismatched tiles adds one lapse', () => {
  const game = createGame(['blue', 'red', 'blue', 'green', 'red', 'green', 'orange', 'orange']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  flipPair(game, 2, 3);
  game.hideMismatch();
  assert.equal(game.lapses, 1);

  assert.equal(game.flip(6), true);
  assert.equal(game.lapses, 1);
  assert.equal(game.flip(4), true);
  assert.equal(game.attempts, 3);
  assert.equal(game.lapses, 2);

  game.hideMismatch();
  flipPair(game, 1, 4);
  assert.equal(game.lapses, 2);
  assert.equal(game.tiles[0].matched, false);
  assert.equal(game.tiles[2].matched, false);
});

test('skipping a known pair and then ignoring the first tile’s known mate adds two lapses', () => {
  const game = createGame(['blue', 'red', 'blue', 'green', 'red', 'green']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  flipPair(game, 2, 3);
  game.hideMismatch();
  assert.equal(game.lapses, 1);

  assert.equal(game.flip(4), true);
  assert.equal(game.lapses, 1);
  assert.equal(game.flip(5), true);
  assert.equal(game.attempts, 3);
  assert.equal(game.lapses, 3);
});

test('completed pairs do not penalize exploring fresh tiles', () => {
  const game = createGame(['blue', 'red', 'blue', 'green', 'red', 'green', 'orange', 'orange']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  flipPair(game, 2, 0);
  flipPair(game, 3, 6);
  assert.equal(game.attempts, 3);
  assert.equal(game.lapses, 0);
});

test('reopening two exposed nonmatching tiles can cause two lapses', () => {
  const game = createGame(['blue', 'red', 'blue', 'red']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  assert.equal(game.flip(1), true);
  assert.equal(game.lapses, 0);
  assert.equal(game.flip(0), true);
  assert.equal(game.lapses, 2);
  assert.equal(game.attempts, 2);
});

test('an immediate repeat on the next turn is accepted and a lucky match earns zero lapses', () => {
  const game = createGame(['blue', 'red', 'blue', 'red']);

  flipPair(game, 0, 1);
  game.hideMismatch();
  assert.equal(game.flip(0), true);
  assert.equal(game.lapses, 0);
  assert.equal(game.flip(2), true);
  assert.equal(game.lapses, 0);
  assert.equal(game.tiles[0].matched, true);
  assert.equal(game.tiles[2].matched, true);
});

test('taps on an open tile, matched tile and during a mismatch are ignored', () => {
  const game = createGame(['blue', 'red', 'blue', 'red']);

  assert.equal(game.flip(0), true);
  assert.equal(game.flip(0), false);
  assert.equal(game.attempts, 0);
  assert.equal(game.flip(1), true);
  assert.equal(game.tiles[0].faceUp, true);
  assert.equal(game.tiles[1].faceUp, true);
  assert.equal(game.flip(2), false);
  assert.equal(game.tiles[2].seen, false);
  assert.equal(game.attempts, 1);
  assert.equal(game.lapses, 0);
  game.hideMismatch();

  flipPair(game, 2, 0);
  assert.equal(game.flip(0), false);
  assert.equal(game.attempts, 2);
  assert.equal(game.lapses, 0);
});
