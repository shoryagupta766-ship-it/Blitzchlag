// src/modules/scene3d.js
// ──────────────────────────────────────────────────────────────
// THIN ADAPTER — the router imports this file and calls
// initScene(container) / destroyScene(container).  We delegate
// to GameManager which owns the actual Three.js scene.
//
// This file exists purely to preserve the public contract that
// the rest of the app relies on.  No Three.js code belongs here.
// ──────────────────────────────────────────────────────────────
import '../styles/scene.css';
import { GameManager } from '../game/GameManager.js';

let game = null;

/**
 * Mount the 3D driving experience into the given container.
 * Called by the router when the user navigates to #/home.
 */
export function initScene(container) {
  game = new GameManager();
  game.init(container);
}

/**
 * Full teardown: stop loop, remove listeners, dispose GPU
 * resources, forceContextLoss(), clear the container.
 * Called by the router before navigating away from #/home.
 */
export function destroyScene(container) {
  if (game) {
    game.destroy(container);
    game = null;
  }
}
