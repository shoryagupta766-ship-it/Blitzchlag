// src/game/landmarks/WtpMall.js
// PASSES Destination Landmark. Exports anchor {position, facing}.

import * as THREE from 'three';
import { placeBeside } from '../utils/placement.js';

export class WtpMall {
  constructor(parentGroup, curve, t, lateral) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const { position, faceRoad, angleY } = placeBeside(curve, t, lateral);
    this.anchor = { position, facing: faceRoad }; // Exported for Lesson 5

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = angleY;

    const glassMat = new THREE.MeshLambertMaterial({ color: 0x3B7A9E });
    this._emissiveMat = new THREE.MeshLambertMaterial({ color: 0x3B7A9E, emissive: 0x3B7A9E, emissiveIntensity: 0 });

    const towerGeo = new THREE.BoxGeometry(8, 16, 8);
    const leftT = new THREE.Mesh(towerGeo, glassMat);
    leftT.position.set(0, 8, -4.5);
    const rightT = new THREE.Mesh(towerGeo, glassMat);
    rightT.position.set(0, 8, 4.5);

    const bridgeGeo = new THREE.BoxGeometry(4, 3, 4);
    const bridge = new THREE.Mesh(bridgeGeo, this._emissiveMat);
    bridge.position.set(2, 12, 0);

    group.add(leftT, rightT, bridge);
    this.parent.add(group);
    this.meshes.push(group, leftT, rightT, bridge);
  }

  setNightFactor(n) {
    this._emissiveMat.emissiveIntensity = n;
  }

  dispose() {
    this.meshes.forEach(m => {
      if (m.isMesh) {
        m.geometry.dispose();
        m.material.dispose();
      }
    });
    this.parent.remove(this.meshes[0]);
  }
}