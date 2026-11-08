# Memory Match — Kids Edition

[![CI](https://github.com/isbhuvan/memory-game/actions/workflows/ci.yml/badge.svg)](https://github.com/isbhuvan/memory-game/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A flip-the-tiles memory game for desktop and mobile, with picture tiles that young kids can recognise: a house, a heart, ice cream, a flower, a tree and more.

## Why this exists

There are plenty of memory games online, but I wanted a simple one for kids that records **how long** and **how many tries** each round takes, so they can try to beat their own best.

## Features

- **Three levels** — Easy (12 tiles), Medium (16 tiles) and Hard (24 tiles).
- **Timer and tries** — the clock starts on the first flip; every pair you turn over counts as one try.
- **Best scores** — the best time and fewest tries are remembered per level in the browser.
- **Celebration** — confetti and a "You did your best!" message when you finish, with a special banner for a new personal best.
- **Light and dark themes** — follows your system, with a manual toggle that is remembered.
- **Accessible** — keyboard play, screen-reader labels, live status updates, and reduced-motion support.
- **Mobile friendly** — responsive layout with instant touch feedback.
- **No dependencies, no build step** — plain HTML, CSS and ES modules.

## Play

Hosted on GitHub Pages via the included workflow (once Pages is enabled for the repo, see [Deployment](#deployment)).

Or run it locally:

```sh
make serve          # http://localhost:8080
make serve PORT=3000
```

Opening `src/index.html` directly from disk won't work, because browsers block ES modules on `file://`. Use `make serve` (needs Python 3) or any static server.

## How a round works

1. Pick a level. All tiles start face down.
2. Flip two tiles. If the pictures match they stay open; if not, both flip back.
3. Match every pair to finish. Your time and tries are compared with your best for that level.
4. **New game** reshuffles the tiles at any time.

## Development

```sh
make help     # list targets
make test     # unit tests (Node 20+)
make check    # syntax check + tests (what CI runs)
```

Project layout:

```
src/
  index.html      page markup
  favicon.svg
  css/style.css   styles and themes
  js/game.js      matching rules and levels (pure, no DOM)
  js/stats.js     time formatting and best-score logic (pure, no DOM)
  js/theme.js     light/dark theme handling
  js/dom.js       wires the logic to the page
test/             node:test unit tests for game.js and stats.js
.github/          CI and GitHub Pages deploy workflows
```

The game and stats logic have no DOM access, which keeps them easy to test. See [CONTRIBUTING.md](CONTRIBUTING.md) if you'd like to help.

## Deployment

`.github/workflows/deploy.yml` runs the checks and publishes `src/` to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## License

[MIT](LICENSE) — free to use, modify and share. Have fun!
