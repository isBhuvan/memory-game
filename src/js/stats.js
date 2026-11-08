/** Format whole seconds as m:ss. */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * A result beats the previous best if it is faster, or equally fast with
 * fewer tries. With no previous best, any result is a record.
 */
export function isNewBest(previous, result) {
  if (!previous) return true;
  if (result.seconds !== previous.seconds) return result.seconds < previous.seconds;
  return result.tries < previous.tries;
}

/** Return the best map with `result` recorded for `level` if it is a record. */
export function recordResult(bests, level, result) {
  if (!isNewBest(bests[level], result)) return { bests, isBest: false };
  return { bests: { ...bests, [level]: { seconds: result.seconds, tries: result.tries } }, isBest: true };
}

/** Kid-friendly message for the end of a round. */
export function summarize(result, previous, isBest) {
  const base = `You finished in ${formatTime(result.seconds)} with ${result.tries} tries.`;
  if (isBest) return previous ? `${base} That's your new best!` : `${base} That's your first best!`;
  return `${base} Your best is ${formatTime(previous.seconds)} with ${previous.tries} tries. Can you beat it?`;
}
