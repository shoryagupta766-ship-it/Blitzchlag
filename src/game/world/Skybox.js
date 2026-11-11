// src/game/world/Skybox.js
// Large inverted sphere with a GLSL gradient shader.
// No texture downloads. GSAP-animatable uniforms for day→night.
import * as THREE from 'three';
import { ZONES } from '../config.js';

const vertexShader = /* glsl */ `
  varying float vY;
  void main() {
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uTopColor;
  uniform vec3  uBottomColor;
  uniform float uRadius;
  uniform float uExponent;
  varying float vY;
  void main() {
    float h = clamp((vY / uRadius) * 0.5 + 0.5, 0.0, 1.0);
    h = pow(h, uExponent);
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, h), 1.0);
  }
`;

export class Skybox {
  constructor(scene) {
    this._scene = scene;
    const RADIUS = 450;
    const zone0 = ZONES[0];

    const geo = new THREE.SphereGeometry(RADIUS, 32, 16);
    this._material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTopColor:    { value: new THREE.Color(zone0.skyTop) },
        uBottomColor: { value: new THREE.Color(zone0.skyBottom) },
        uRadius:      { value: RADIUS },
        uExponent:    { value: 0.8 },
      },
      side:       THREE.BackSide,
      depthWrite: false,
    });

    this._mesh = new THREE.Mesh(geo, this._material);
    this._mesh.renderOrder = -1;
    this._mesh.frustumCulled = false;
    this._scene.add(this._mesh);
  }

  update(cameraPosition) {
    this._mesh.position.copy(cameraPosition);
  }

  setColors(topHex, bottomHex) {
    this._material.uniforms.uTopColor.value.set(topHex);
    this._material.uniforms.uBottomColor.value.set(bottomHex);
  }

  get topColor()    { return this._material.uniforms.uTopColor.value; }
  get bottomColor() { return this._material.uniforms.uBottomColor.value; }

  dispose() {
    this._scene.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._material.dispose();
  }
}