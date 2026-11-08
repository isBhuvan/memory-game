# Contributing

Thanks for taking a look! Small, focused changes are easiest to review.

1. Fork and create a branch.
2. Run the game with `make serve` and try your change on a narrow (phone) viewport and in both themes.
3. Add or update tests in `test/` for any change to `game.js` or `stats.js`.
4. Run `make check` — CI runs the same thing.
5. Open a pull request describing what and why.

## Guidelines

- Keep it dependency-free: plain HTML, CSS and ES modules.
- Keep game rules and stats free of DOM access so they stay testable.
- Keep icons easy for young kids to recognise.
- Preserve accessibility: keyboard support, labels, and `prefers-reduced-motion`.
- Match the existing style (see `.editorconfig`).
