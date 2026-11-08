import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, FLIP, LEVELS, ICONS, buildDeck, shuffle } from '../src/js/game.js';

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** Find the indices of a matching pair and of two non-matching tiles. */
function pickIndices(game) {
  const ids = game.deck.map((c) => c.id);
  const a = 0;
  const pair = ids.findIndex((id, i) => i !== a && id === ids[a]);
  const other = ids.findIndex((id) => id !== ids[a]);
  return { a, pair, other };
}

test('levels grow in tile count', () => {
  const sizes = Object.values(LEVELS).map((l) => l.pairs * 2);
  assert.deepEqual(sizes, [12, 16, 24]);
  assert.ok(sizes.every((n, i) => i === 0 || n > sizes[i - 1]));
});

test('every level fits a full grid and the icon set', () => {
  for (const { pairs, cols } of Object.values(LEVELS)) {
    assert.equal((pairs * 2) % cols, 0);
    assert.ok(pairs <= ICONS.length);
  }
});

test('deck holds exactly two of each chosen icon', () => {
  const deck = buildDeck(8, seeded());
  assert.equal(deck.length, 16);
  const counts = {};
  for (const c of deck) counts[c.id] = (counts[c.id] ?? 0) + 1;
  assert.equal(Object.keys(counts).length, 8);
  assert.ok(Object.values(counts).every((n) => n === 2));
});

test('buildDeck rejects invalid pair counts', () => {
  assert.throws(() => buildDeck(0), RangeError);
  assert.throws(() => buildDeck(ICONS.length + 1), RangeError);
  assert.throws(() => buildDeck(2.5), RangeError);
});

test('shuffle does not mutate its input', () => {
  const input = [1, 2, 3, 4];
  shuffle(input, seeded());
  assert.deepEqual(input, [1, 2, 3, 4]);
});

test('unknown level is rejected', () => {
  assert.throws(() => new Game('impossible'), RangeError);
});

test('matching pair stays open and counts one try', () => {
  const g = new Game('easy', seeded());
  const { a, pair } = pickIndices(g);
  assert.equal(g.flip(a), FLIP.FIRST);
  assert.equal(g.tries, 0);
  assert.equal(g.flip(pair), FLIP.MATCH);
  assert.equal(g.tries, 1);
  assert.deepEqual([...g.matched].sort(), [a, pair].sort());
});

test('mismatch blocks flips until hidden, then both tiles close', () => {
  const g = new Game('easy', seeded());
  const { a, other } = pickIndices(g);
  g.flip(a);
  assert.equal(g.flip(other), FLIP.MISMATCH);
  assert.equal(g.tries, 1);
  const third = g.deck.findIndex((_, i) => i !== a && i !== other);
  assert.equal(g.flip(third), FLIP.IGNORED);
  assert.deepEqual(g.hideMismatch(), [a, other]);
  assert.equal(g.revealed.size, 0);
  assert.equal(g.flip(third), FLIP.FIRST);
});

test('ignores the same tile twice, matched tiles and bad indices', () => {
  const g = new Game('easy', seeded());
  const { a, pair } = pickIndices(g);
  g.flip(a);
  assert.equal(g.flip(a), FLIP.IGNORED);
  assert.equal(g.tries, 0);
  g.flip(pair);
  assert.equal(g.flip(a), FLIP.IGNORED);
  assert.equal(g.flip(-1), FLIP.IGNORED);
  assert.equal(g.flip(999), FLIP.IGNORED);
  assert.equal(g.flip(1.5), FLIP.IGNORED);
});

test('game completes once every pair is matched', () => {
  const g = new Game('easy', seeded());
  const seen = new Map();
  g.deck.forEach((c, i) => seen.set(c.id, [...(seen.get(c.id) ?? []), i]));
  for (const [x, y] of seen.values()) {
    assert.equal(g.complete, false);
    g.flip(x);
    g.flip(y);
  }
  assert.equal(g.complete, true);
  assert.equal(g.tries, g.pairs);
  assert.equal(g.flip(0), FLIP.IGNORED);
});
