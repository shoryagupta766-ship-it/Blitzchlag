// src/game/world/zoneA/Billboards.js
// Instanced roadside billboards featuring dynamic canvas textures.

import * as THREE from 'three';
import { FEST } from '../../config.js';
import { placeBeside } from '../../utils/placement.js';

export class Billboards {
  constructor(parentGroup, curve, config, zoneConfig) {
    this.parent = parentGroup;
    this.meshes = [];
    this._build(curve, config.count, zoneConfig);
  }

  _createTexture(text, bgHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    return new THREE.CanvasTexture(canvas);
  }

  _build(curve, count, zoneConfig) {
    const tex1 = this._createTexture(FEST.hashtag, '#D4A017');
    const tex2 = this._createTexture('PASSES LIVE NOW', '#5B1A1A');
    
    const mat1 = new THREE.MeshLambertMaterial({ map: tex1, emissive: 0xFFFFFF, emissiveIntensity: 0 });
    const mat2 = new THREE.MeshLambertMaterial({ map: tex2, emissive: 0xFFFFFF, emissiveIntensity: 0 });
    this._mats = [mat1, mat2];

    const frameGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
    frameGeo.translate(0, 2, 0);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x2C3539 });
    const frames = new THREE.InstancedMesh(frameGeo, frameMat, count * 2);

    const boardGeo = new THREE.BoxGeometry(4, 2, 0.2);
    boardGeo.translate(0, 3.5, 0);
    const boards1 = new THREE.InstancedMesh(boardGeo, mat1, Math.ceil(count / 2));
    const boards2 = new THREE.InstancedMesh(boardGeo, mat2, Math.floor(count / 2));

    const dummy = new THREE.Object3D();
    let fIdx = 0, b1Idx = 0, b2Idx = 0;

    for (let i = 0; i < count; i++) {
      const t = zoneConfig.tStart + 0.05 + (i / count) * 0.25;
      const lateral = i % 2 === 0 ? 7.5 : -7.5;
      const { position, faceRoad } = placeBeside(curve, t, lateral);

      // Two poles
      dummy.position.copy(position).add(new THREE.Vector3(1.5, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), faceRoad));
      dummy.rotation.set(0, faceRoad, 0);
      dummy.updateMatrix();
      frames.setMatrixAt(fIdx++, dummy.matrix);

      dummy.position.copy(position).add(new THREE.Vector3(-1.5, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), faceRoad));
      dummy.updateMatrix();
      frames.setMatrixAt(fIdx++, dummy.matrix);

      // Board
      dummy.position.copy(position);
      dummy.updateMatrix();
      if (i % 2 === 0) {
        boards1.setMatrixAt(b1Idx++, dummy.matrix);
      } else {
        boards2.setMatrixAt(b2Idx++, dummy.matrix);
      }
    }

    frames.instanceMatrix.needsUpdate = true;
    boards1.instanceMatrix.needsUpdate = true;
    boards2.instanceMatrix.needsUpdate = true;

    this.parent.add(frames, boards1, boards2);
    this.meshes.push(frames, boards1, boards2);
  }

  setNightFactor(n) {
    this._mats.forEach(m => m.emissiveIntensity = n * 0.3);
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
      if (m.material.map) m.material.map.dispose();
    });
  }
}