// src/game/utils/accessibility.js
// ──────────────────────────────────────────────────────────────
// Accessibility gates.  Every module that adds motion, particles,
// or camera shake checks these before enabling the effect.
// ──────────────────────────────────────────────────────────────

/**
 * True when the OS / browser requests minimal motion.
 * Result is cached — the media-query won't change mid-session.
 */
let _reducedMotion = null;
export function prefersReducedMotion() {
  if (_reducedMotion === null) {
    _reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return _reducedMotion;
}
