// src/modules/scene3d.js
// Adapter handling WebGL context failures and reduced-motion fallbacks.

import '../styles/scene.css';
import { GameManager } from '../game/GameManager.js';
import { StaticSkyline } from '../game/fallback/StaticSkyline.js';
import { prefersReducedMotion } from '../game/utils/accessibility.js';

let game = null;
let fallback = null;

export function initScene(container) {
  const force3D = localStorage.getItem('blitz.force3D') === 'true';
  const reduced = prefersReducedMotion();

  // Show fallback if reduced motion is preferred (and user didn't explicitly override)
  if (reduced && !force3D) {
    fallback = new StaticSkyline(container);
    return;
  }

  try {
    game = new GameManager();
    game.init(container);
  } catch (error) {
    console.warn("WebGL initialization failed, loading fallback skyline.", error);
    if (game) {
      game.destroy(container);
      game = null;
    }
    fallback = new StaticSkyline(container);
  }
}

export function destroyScene(container) {
  if (game) {
    game.destroy(container);
    game = null;
  }
  if (fallback) {
    fallback.dispose();
    fallback = null;
  }
}