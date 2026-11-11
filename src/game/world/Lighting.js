// src/game/world/Lighting.js
// ──────────────────────────────────────────────────────────────
// Two lights give us the "warm Jaipur golden-hour" feel:
//
//  1. HemisphereLight — cheap ambient that colours sky-facing
//     surfaces warm-white and ground-facing ones earthy-brown.
//  2. DirectionalLight — a fake sun whose colour/intensity will
//     be GSAP-transitioned zone-by-zone in Lesson 8.
//
// No shadows in Lesson 1 (saves 1 extra render pass).
// ──────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { PALETTE, ZONES } from '../config.js';

export class Lighting {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this._scene = scene;

    const zone0 = ZONES[0];

    // ── Hemisphere (ambient fill) ────────────────────────────
    this._hemi = new THREE.HemisphereLight(
      zone0.sunColor,          // sky colour (top)
      PALETTE.ground,          // ground colour (bottom)
      0.6,                     // intensity
    );
    this._scene.add(this._hemi);

    // ── Directional (sun key-light) ──────────────────────────
    this._sun = new THREE.DirectionalLight(
      zone0.sunColor,
      zone0.sunIntensity,
    );
    // Sun high-left to match golden-hour from the west.
    this._sun.position.set(-50, 80, -200);
    this._scene.add(this._sun);
  }

  /* ── public API for zone transitions (Lesson 8) ────────── */

  get sun()  { return this._sun; }
  get hemi() { return this._hemi; }

  /* ── cleanup ───────────────────────────────────────────── */

  dispose() {
    this._scene.remove(this._hemi);
    this._scene.remove(this._sun);
    // Lights have no geometry/material to dispose, but removing
    // them from the scene is enough.
  }
}
