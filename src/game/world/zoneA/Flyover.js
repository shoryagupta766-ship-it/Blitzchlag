// src/game/world/zoneA/Flyover.js
// Concrete overpass bridging the road.

import * as THREE from 'three';
import { placeBeside } from '../../utils/placement.js';

export class Flyover {
  constructor(parentGroup, curve, t) {
    this.parent = parentGroup;
    this.meshes = [];
    
    const { position, angleY } = placeBeside(curve, t, 0);

    const deckGeo = new THREE.BoxGeometry(20, 1.5, 8);
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xD0C8B8 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.copy(position);
    deck.position.y += 9; // Headroom for elephant
    deck.rotation.y = angleY;

    const pillarGeo = new THREE.BoxGeometry(1.5, 9, 1.5);
    const pillars = new THREE.InstancedMesh(pillarGeo, deckMat, 4);
    
    const dummy = new THREE.Object3D();
    const offsets = [
      [-8, -2], [8, -2], [-8, 2], [8, 2]
    ];
    
    offsets.forEach((off, i) => {
      dummy.position.copy(position);
      dummy.position.y += 4.5;
      const localOffset = new THREE.Vector3(off[0], 0, off[1]).applyAxisAngle(new THREE.Vector3(0,1,0), angleY);
      dummy.position.add(localOffset);
      dummy.rotation.y = angleY;
      dummy.updateMatrix();
      pillars.setMatrixAt(i, dummy.matrix);
    });

    this.parent.add(deck, pillars);
    this.meshes.push(deck, pillars);
  }

  dispose() {
    this.meshes.forEach(m => {
      this.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    });
  }
}