/** Picture tiles that young kids can recognise. */
export const ICONS = [
  { id: 'home', emoji: '🏠', label: 'house' },
  { id: 'heart', emoji: '❤️', label: 'heart' },
  { id: 'icecream', emoji: '🍦', label: 'ice cream' },
  { id: 'flower', emoji: '🌸', label: 'flower' },
  { id: 'tree', emoji: '🌳', label: 'tree' },
  { id: 'star', emoji: '⭐', label: 'star' },
  { id: 'dog', emoji: '🐶', label: 'dog' },
  { id: 'cat', emoji: '🐱', label: 'cat' },
  { id: 'car', emoji: '🚗', label: 'car' },
  { id: 'apple', emoji: '🍎', label: 'apple' },
  { id: 'balloon', emoji: '🎈', label: 'balloon' },
  { id: 'fish', emoji: '🐟', label: 'fish' },
  { id: 'sun', emoji: '☀️', label: 'sun' },
  { id: 'moon', emoji: '🌙', label: 'moon' },
  { id: 'butterfly', emoji: '🦋', label: 'butterfly' },
  { id: 'banana', emoji: '🍌', label: 'banana' },
];

export const LEVELS = {
  easy: { label: 'Easy', pairs: 6, cols: 3 },
  medium: { label: 'Medium', pairs: 8, cols: 4 },
  hard: { label: 'Hard', pairs: 12, cols: 4 },
};

export const FLIP = Object.freeze({
  IGNORED: 'ignored',
  FIRST: 'first',
  MATCH: 'match',
  MISMATCH: 'mismatch',
});

/** Fisher–Yates shuffle returning a new array. `random` is injectable for tests. */
export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Build a shuffled deck holding two of each of `pairs` random icons. */
export function buildDeck(pairs, random = Math.random) {
  if (!Number.isInteger(pairs) || pairs < 1 || pairs > ICONS.length) {
    throw new RangeError(`pairs must be an integer from 1 to ${ICONS.length}`);
  }
  const chosen = shuffle(ICONS, random).slice(0, pairs);
  return shuffle([...chosen, ...chosen], random);
}

/**
 * Memory-match rules. Pure state: no DOM, no timers.
 * After a MISMATCH the caller must call `hideMismatch()` once the player has
 * had a moment to see the tiles; flips are ignored until then.
 */
export class Game {
  constructor(levelName = 'easy', random = Math.random) {
    const level = LEVELS[levelName];
    if (!level) throw new RangeError(`unknown level: ${levelName}`);
    this.level = levelName;
    this.deck = buildDeck(level.pairs, random);
    this.pairs = level.pairs;
    this.revealed = new Set(); // face-up, unmatched
    this.matched = new Set();
    this.pending = null; // the two indices of an unresolved mismatch
    this.tries = 0;
  }

  get complete() {
    return this.matched.size === this.deck.length;
  }

  /** Flip the tile at `index`. Returns a FLIP result. */
  flip(index) {
    if (
      this.pending ||
      this.complete ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.deck.length ||
      this.revealed.has(index) ||
      this.matched.has(index)
    ) {
      return FLIP.IGNORED;
    }

    if (this.revealed.size === 0) {
      this.revealed.add(index);
      return FLIP.FIRST;
    }

    const [first] = this.revealed;
    this.tries += 1;
    if (this.deck[first].id === this.deck[index].id) {
      this.revealed.clear();
      this.matched.add(first).add(index);
      return FLIP.MATCH;
    }
    this.revealed.add(index);
    this.pending = [first, index];
    return FLIP.MISMATCH;
  }

  /** Turn an unmatched pair back face down. Returns the indices hidden. */
  hideMismatch() {
    const hidden = this.pending ?? [];
    this.pending = null;
    this.revealed.clear();
    return hidden;
  }
}
