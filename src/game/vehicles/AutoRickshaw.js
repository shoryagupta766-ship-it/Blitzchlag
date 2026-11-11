// src/game/vehicles/AutoRickshaw.js
import * as THREE from 'three';
import { PALETTE } from '../config.js';

export function createAutoRickshaw(config) {
  const group = new THREE.Group();
  
  const bodyMat = new THREE.MeshLambertMaterial({ color: config.color });
  const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(1.4, 0.8, 2.2);
  chassisGeo.translate(0, 0.6, 0);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  group.add(chassis);

  // Canopy
  const canopyGeo = new THREE.BoxGeometry(1.4, 1.0, 1.8);
  canopyGeo.translate(0, 1.5, -0.2);
  const canopy = new THREE.Mesh(canopyGeo, blackMat);
  group.add(canopy);

  // Headlight
  const lightGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
  const light = new THREE.Mesh(lightGeo, lightMat);
  light.position.set(0, 0.7, 1.15);
  group.add(light);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  
  const wheels = [];
  const positions = [ [0, 0.3, 1.0], [-0.7, 0.3, -0.7], [0.7, 0.3, -0.7] ];
  
  positions.forEach(pos => {
    const w = new THREE.Mesh(wheelGeo, blackMat);
    w.position.set(...pos);
    group.add(w);
    wheels.push(w);
  });

  const seat = new THREE.Object3D();
  seat.position.set(0, config.cameraY, -0.5);
  group.add(seat);

  return {
    group,
    seat,
    update: (dt, speed, steer) => {
      // Spin wheels based on speed, steer front wheel
      const spin = speed * dt * 2;
      wheels.forEach(w => w.rotation.x += spin);
      wheels[0].rotation.y = steer * 0.3; // front wheel turns
    },
    dispose: () => {
      [chassisGeo, canopyGeo, lightGeo, wheelGeo].forEach(g => g.dispose());
      [bodyMat, blackMat, lightMat].forEach(m => m.dispose());
    }
  };
}