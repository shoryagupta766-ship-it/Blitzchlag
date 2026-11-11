// src/game/destinations/DestinationMarker.js
// 3D visual indicator (ring, beam, billboard sprite).

import * as THREE from 'three';

export class DestinationMarker {
  constructor(scene, dest, anchor, isVisited) {
    this._scene = scene;
    this.dest = dest;
    this.meshes = [];
    this.materials = [];
    
    this.group = new THREE.Group();
    // Position slightly in front of the landmark anchor
    this.group.position.copy(anchor.position);
    this.group.position.add(new THREE.Vector3(0, 0, 4).applyAxisAngle(new THREE.Vector3(0, 1, 0), anchor.facing));
    this.group.position.y = 0.1;

    const colorHex = isVisited ? 0x008080 : 0xD4A017; // Teal if visited, Mustard if not

    // Ground Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.15, 8, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.ring);

    // Vertical Light Beam
    const beamGeo = new THREE.CylinderGeometry(2.2, 2.2, 15, 16, 1, true);
    beamGeo.translate(0, 7.5, 0);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: colorHex, 
      transparent: true, 
      opacity: 0.25, 
      blending: THREE.AdditiveBlending, 
      depthWrite: false, 
      side: THREE.DoubleSide 
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    this.group.add(beam);

    // Floating Billboard Label
    const tex = this._createLabelTexture(`0${dest.id} ${dest.name}`, colorHex);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthWrite: false });
    this.sprite = new THREE.Sprite(spriteMat);
    this.sprite.scale.set(6, 1.5, 1);
    this.sprite.position.set(0, 10, 0);
    this.group.add(this.sprite);

    this.materials.push(ringMat, beamMat, spriteMat);
    this.meshes.push(this.ring, beam, this.sprite);
    
    this._scene.add(this.group);
  }

  _createLabelTexture(text, hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Pill background
    ctx.fillStyle = `#${hexColor.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 54);
    ctx.fill();

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  update(dt, cameraPos) {
    // Pulse ring
    const time = performance.now() * 0.002;
    this.ring.scale.setScalar(1 + Math.sin(time) * 0.1);
    this.ring.rotation.z += dt * 0.5;
  }

  dispose() {
    this._scene.remove(this.group);
    this.meshes.forEach(m => {
      if (m.geometry) m.geometry.dispose();
    });
    this.materials.forEach(m => {
      if (m.map) m.map.dispose();
      m.dispose();
    });
  }
}