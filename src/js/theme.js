const STORAGE_KEY = 'memory-theme';
const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

const readStored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null; // storage blocked (private mode, etc.)
  }
};

const writeStored = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* non-persistent choice is fine */
  }
};

const svg = (body) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;

// Chunky crescent with stars, so it reads as "night" and not a banana.
const MOON = svg(
  '<path fill="#fbbf24" d="M20 14.8A8.5 8.5 0 1 1 9.2 4a6.7 6.7 0 0 0 10.8 10.8z"/>' +
    '<path fill="#fde68a" d="M17.5 3l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>'
);

const SUN = svg(
  '<circle cx="12" cy="12" r="4.5" fill="#fb923c"/>' +
    '<g stroke="#f59e0b" stroke-width="2" stroke-linecap="round">' +
    '<path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>' +
    '</g>'
);

const resolve = () => readStored() ?? (systemQuery.matches ? 'dark' : 'light');

/**
 * Wire a toggle button to the theme. Follows the system preference until
 * the user picks a theme explicitly.
 */
export function initTheme(button) {
  const apply = (theme) => {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    button.innerHTML = dark ? SUN : MOON;
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0f1020' : '#4f46e5');
  };

  apply(resolve());

  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    writeStored(next);
    apply(next);
  });

  systemQuery.addEventListener('change', () => {
    if (!readStored()) apply(resolve());
  });
}
