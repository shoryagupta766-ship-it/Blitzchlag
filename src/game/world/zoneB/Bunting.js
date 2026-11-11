// src/game/world/zoneB/Bunting.js
// Catenary-style curved flags swaying via a GLSL vertex shader injection.

import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class Bunting {
  constructor(parentGroup, curve, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    
    // Shader modification for wind sway
    this._uniforms = { uTime: { value: 0 } };
    const material = new THREE.MeshLambertMaterial({ color: 0xD4A017, side: THREE.DoubleSide });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this._uniforms.uTime;
      shader.vertexShader = `
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         // Gentle sway based on world position and time
         transformed.x += sin(position.y * 2.0 + uTime * 2.0) * 0.2 * (1.0 - uv.y);
        `
      );
    };

    // A single triangular flag
    const flagGeo = new THREE.ConeGeometry(0.3, 0.6, 3);
    flagGeo.rotateX(Math.PI);
    
    const count = 250;
    const bunting = new THREE.InstancedMesh(flagGeo, material, count);
    
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const colors = [0xD4A017, 0x5B1A1A, 0x0A0E2A, 0xE8C5A0];
    
    let idx = 0;
    // Stretch across the road every ~12 units
    for (let t = zoneConfig.tStart + 0.02; t < zoneConfig.tEnd; t += 0.015) {
      if (idx >= count - 10) break;
      const left = placeBeside(curve, t, -12);
      const right = placeBeside(curve, t, 12);
      
      // Plot flags along a simplified catenary (parabola approximation for speed)
      for (let i = 1; i < 9; i++) {
        const frac = i / 9;
        const sag = Math.pow((frac - 0.5) * 2, 2) * -1.5 + 1.5; // inverted parabola
        
        dummy.position.lerpVectors(left.position, right.position, frac);
        dummy.position.y = 8 - sag;
        dummy.rotation.set(0, left.faceRoad, 0.2 * (frac - 0.5));
        dummy.updateMatrix();
        
        bunting.setMatrixAt(idx, dummy.matrix);
        color.setHex(colors[i % colors.length]);
        bunting.setColorAt(idx, color);
        idx++;
      }
    }
    
    bunting.count = idx;
    bunting.instanceMatrix.needsUpdate = true;
    bunting.instanceColor.needsUpdate = true;
    
    this.parent.add(bunting);
    this.meshes.push(bunting);
  }

  update(dt, t) {
    this._uniforms.uTime.value += dt;
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}