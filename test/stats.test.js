import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, isNewBest, recordResult, summarize } from '../src/js/stats.js';

test('formats seconds as m:ss', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(7), '0:07');
  assert.equal(formatTime(75), '1:15');
  assert.equal(formatTime(-3), '0:00');
  assert.equal(formatTime(61.9), '1:01');
});

test('first result is always a best', () => {
  assert.equal(isNewBest(undefined, { seconds: 99, tries: 50 }), true);
});

test('faster beats slower; ties are broken by fewer tries', () => {
  const prev = { seconds: 30, tries: 10 };
  assert.equal(isNewBest(prev, { seconds: 29, tries: 20 }), true);
  assert.equal(isNewBest(prev, { seconds: 31, tries: 1 }), false);
  assert.equal(isNewBest(prev, { seconds: 30, tries: 9 }), true);
  assert.equal(isNewBest(prev, { seconds: 30, tries: 10 }), false);
});

test('recordResult keeps levels independent and does not mutate', () => {
  const bests = { easy: { seconds: 20, tries: 8 } };
  const r1 = recordResult(bests, 'hard', { seconds: 90, tries: 30 });
  assert.equal(r1.isBest, true);
  assert.deepEqual(r1.bests.easy, bests.easy);
  assert.deepEqual(r1.bests.hard, { seconds: 90, tries: 30 });
  assert.equal(bests.hard, undefined);

  const r2 = recordResult(bests, 'easy', { seconds: 25, tries: 5 });
  assert.equal(r2.isBest, false);
  assert.equal(r2.bests, bests);
});

test('summary mentions the previous best when not a record', () => {
  const prev = { seconds: 20, tries: 8 };
  assert.match(summarize({ seconds: 25, tries: 9 }, prev, false), /Your best is 0:20 with 8 tries/);
  assert.match(summarize({ seconds: 15, tries: 7 }, prev, true), /new best/);
  assert.match(summarize({ seconds: 15, tries: 7 }, undefined, true), /first best/);
});
