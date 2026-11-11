// src/game/utils/perf.js
// ──────────────────────────────────────────────────────────────
// Lightweight performance utilities.  Nothing here touches the
// DOM — pure detection so other modules can branch on device
// capability without repeating the same checks.
// ──────────────────────────────────────────────────────────────
import { PERFORMANCE } from '../config.js';

/**
 * Returns 'low' for ≤ 4 logical cores (most budget phones),
 * 'high' otherwise.  Used to halve particle counts, reduce
 * segment counts, disable post-processing, etc.
 */
export function getDeviceTier() {
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 4 ? 'low' : 'high';
}

/**
 * Device pixel ratio capped at the performance budget ceiling.
 * On a 3× Retina phone this returns 2 — enough to look sharp
 * without tripling fill-rate cost.
 */
export function getPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, PERFORMANCE.maxPixelRatio);
}

/**
 * True when the primary pointer is coarse (finger, not mouse).
 * Gates the mobile-joystick and hides keyboard-only hints.
 */
export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}
