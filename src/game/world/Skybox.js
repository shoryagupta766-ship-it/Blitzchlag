// src/game/world/Skybox.js
// ──────────────────────────────────────────────────────────────
// A large inverted sphere with a custom vertex-colour gradient
// from horizon to zenith.  Uniforms let us GSAP-transition the
// palette in Lesson 8 as the player drives from golden-hour
// into night.
//
// Why a shader and not a texture?
// ● Zero file-size — no skybox image to download.
// ● Infinitely smooth gradients at any resolution.
// ● Animatable via uniforms — tween topColor/bottomColor.
// ──────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { ZONES } from '../config.js';

/** Vertex shader — passes the local-Y of each vertex to the
 *  fragment shader so we can map it to a colour gradient. */
const vertexShader = /* glsl */ `
  varying float vY;
  void main() {
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Fragment shader — mix two colours based on normalised height.
 *  The pow(h, exponent) lets us push the horizon band lower. */
const fragmentShader = /* glsl */ `
  uniform vec3  uTopColor;
  uniform vec3  uBottomColor;
  uniform float uRadius;
  uniform float uExponent;

  varying float vY;

  void main() {
    // Normalise vY from [-radius, +radius] → [0, 1]
    float h = clamp((vY / uRadius) * 0.5 + 0.5, 0.0, 1.0);
    h = pow(h, uExponent);
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, h), 1.0);
  }
`;

export class Skybox {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this._scene = scene;

    const RADIUS = 450;

    // Grab the first zone's palette for the initial sky.
    const zone0 = ZONES[0];

    const geo = new THREE.SphereGeometry(RADIUS, 32, 16);
    this._material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTopColor:    { value: new THREE.Color(zone0.skyTop) },
        uBottomColor: { value: new THREE.Color(zone0.skyBottom) },
        uRadius:      { value: RADIUS },
        uExponent:    { value: 0.8 },     // tweak: < 1 = wider top band
      },
      side:         THREE.BackSide,       // render the inside face of the sphere
      depthWrite:   false,                // sky never occludes anything
    });

    this._mesh = new THREE.Mesh(geo, this._material);
    this._scene.add(this._mesh);
  }

  /* ── public API for zone transitions (Lesson 8) ────────── */

  /** Direct-set — used during init or when GSAP isn't needed. */
  setColors(topHex, bottomHex) {
    this._material.uniforms.uTopColor.value.set(topHex);
    this._material.uniforms.uBottomColor.value.set(bottomHex);
  }

  /** Expose the raw uniform objects so GSAP can tween them:
   *  gsap.to(skybox.topColor, { r: 0.04, g: 0.05, b: 0.16 }) */
  get topColor()    { return this._material.uniforms.uTopColor.value; }
  get bottomColor() { return this._material.uniforms.uBottomColor.value; }

  /* ── cleanup ───────────────────────────────────────────── */

  dispose() {
    this._scene.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._material.dispose();
  }
}
