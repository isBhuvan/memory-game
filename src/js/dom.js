import { Game, FLIP, LEVELS } from './game.js';
import { formatTime, recordResult, summarize } from './stats.js';
import { initTheme } from './theme.js';

initTheme(document.getElementById('theme-toggle'));

const STORAGE_KEY = 'memory-best';
const MISMATCH_DELAY = 900;
const WIN_DELAY = 600;
const CONFETTI_COLORS = ['#4f46e5', '#e11d74', '#f59e0b', '#10b981', '#0ea5e9', '#fbbf24'];

const levelsEl = document.getElementById('levels');
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const timeEl = document.getElementById('time');
const triesEl = document.getElementById('tries');
const bestEl = document.getElementById('best');
const resetBtn = document.getElementById('reset');
const dialog = document.getElementById('win-dialog');
const winBadge = document.getElementById('win-badge');
const winTitle = document.getElementById('win-title');
const winSummary = document.getElementById('win-summary');
const playAgainBtn = document.getElementById('play-again');

let levelName = 'easy';
let game;
let tiles = [];
let startedAt = 0;
let ticker = null;
let timeouts = new Set();

const readBests = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {}; // storage blocked or corrupt
  }
};

const writeBests = (bests) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bests));
  } catch {
    /* scores just won't persist */
  }
};

function later(fn, ms) {
  const id = setTimeout(() => {
    timeouts.delete(id);
    fn();
  }, ms);
  timeouts.add(id);
}

const elapsed = () => Math.floor((Date.now() - startedAt) / 1000);

function stopTimer() {
  clearInterval(ticker);
  ticker = null;
}

function startTimer() {
  startedAt = Date.now();
  ticker = setInterval(() => {
    timeEl.textContent = formatTime(elapsed());
  }, 250);
}

function showBest() {
  const best = readBests()[levelName];
  bestEl.textContent = best ? `${formatTime(best.seconds)} · ${best.tries}` : '–';
}

function renderTile(i) {
  const tile = tiles[i];
  const card = game.deck[i];
  const open = game.revealed.has(i) || game.matched.has(i);
  tile.dataset.state = game.matched.has(i) ? 'matched' : open ? 'open' : 'closed';
  tile.setAttribute('aria-pressed', String(open));
  tile.setAttribute('aria-label', open ? card.label : 'Hidden tile');
  tile.disabled = game.matched.has(i);
}

function buildBoard() {
  boardEl.replaceChildren();
  boardEl.style.setProperty('--cols', LEVELS[levelName].cols);
  tiles = game.deck.map((card, i) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.innerHTML =
      '<span class="tile__inner">' +
      '<span class="tile__face tile__face--front" aria-hidden="true"></span>' +
      `<span class="tile__face tile__face--back" aria-hidden="true">${card.emoji}</span>` +
      '</span>';
    tile.addEventListener('click', () => onFlip(i));
    boardEl.appendChild(tile);
    return tile;
  });
  tiles.forEach((_, i) => renderTile(i));
}

function onFlip(i) {
  const result = game.flip(i);
  if (result === FLIP.IGNORED) return;
  if (!ticker) startTimer();

  triesEl.textContent = game.tries;
  renderTile(i);

  if (result === FLIP.FIRST) {
    statusEl.textContent = 'Now find the match!';
  } else if (result === FLIP.MATCH) {
    tiles.forEach((_, j) => renderTile(j));
    statusEl.textContent = 'Great match! 🎉';
    if (game.complete) {
      stopTimer();
      later(finish, WIN_DELAY);
    }
  } else {
    statusEl.textContent = 'Oops, not a match. Try again!';
    boardEl.dataset.locked = '';
    const [a, b] = game.pending;
    tiles[a].classList.add('is-wrong');
    tiles[b].classList.add('is-wrong');
    later(() => {
      game.hideMismatch();
      delete boardEl.dataset.locked;
      [a, b].forEach((j) => {
        tiles[j].classList.remove('is-wrong');
        renderTile(j);
      });
    }, MISMATCH_DELAY);
  }
}

function finish() {
  const result = { seconds: elapsed(), tries: game.tries };
  timeEl.textContent = formatTime(result.seconds);
  const previous = readBests()[levelName];
  const { bests, isBest } = recordResult(readBests(), levelName, result);
  if (isBest) writeBests(bests);
  showBest();

  winBadge.textContent = isBest ? '🏆' : '🌟';
  winTitle.textContent = isBest ? 'You did your best!' : 'Well done!';
  winSummary.textContent = summarize(result, previous, isBest);
  statusEl.textContent = 'All matched!';
  confetti(isBest ? 70 : 40);
  if (!dialog.open) dialog.showModal();
}

function clearConfetti() {
  document.querySelectorAll('.confetti').forEach((layer) => layer.remove());
}

/** Drop a burst of confetti pieces over the page. */
function confetti(count) {
  clearConfetti();
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti__piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.setProperty('--delay', `${Math.random() * 0.6}s`);
    piece.style.setProperty('--dur', `${2 + Math.random() * 1.5}s`);
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}vw`);
    piece.style.setProperty('--spin', `${360 + Math.random() * 720}deg`);
    layer.appendChild(piece);
  }
  // The modal dialog sits in the top layer, so the burst lives inside it.
  (dialog.open ? dialog : document.body).appendChild(layer);
  later(() => layer.remove(), 4500);
}

function newGame() {
  stopTimer();
  timeouts.forEach(clearTimeout);
  timeouts.clear();
  clearConfetti();
  if (dialog.open) dialog.close();
  delete boardEl.dataset.locked;

  game = new Game(levelName);
  buildBoard();
  timeEl.textContent = '0:00';
  triesEl.textContent = '0';
  statusEl.textContent = 'Flip a tile to start!';
  showBest();
}

function selectLevel(name) {
  levelName = name;
  levelsEl.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.level === name));
  });
  newGame();
}

for (const [name, { label, pairs }] of Object.entries(LEVELS)) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'level';
  btn.dataset.level = name;
  btn.textContent = `${label} · ${pairs * 2}`;
  btn.addEventListener('click', () => selectLevel(name));
  levelsEl.appendChild(btn);
}

resetBtn.addEventListener('click', newGame);
playAgainBtn.addEventListener('click', newGame);
dialog.addEventListener('close', clearConfetti);

selectLevel(levelName);
