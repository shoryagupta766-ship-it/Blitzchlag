// src/game/vehicles/Camel.js
import * as THREE from 'three';
import { PALETTE } from '../config.js';

export function createCamel(config) {
  const group = new THREE.Group();
  
  const furMat = new THREE.MeshLambertMaterial({ color: config.color });
  const saddleMat = new THREE.MeshLambertMaterial({ color: PALETTE.maroon });

  // Body & Hump
  const bodyGeo = new THREE.BoxGeometry(1.0, 1.2, 1.8);
  bodyGeo.translate(0, 2.0, 0);
  const body = new THREE.Mesh(bodyGeo, furMat);
  group.add(body);

  const humpGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
  const hump = new THREE.Mesh(humpGeo, furMat);
  hump.position.set(0, 2.8, -0.2);
  group.add(hump);

  // Neck & Head
  const neckGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
  const neck = new THREE.Mesh(neckGeo, furMat);
  neck.position.set(0, 2.8, 1.0);
  neck.rotation.x = Math.PI / 6;
  group.add(neck);

  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.8);
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.set(0, 3.4, 1.3);
  group.add(head);

  // Saddle
  const saddleGeo = new THREE.BoxGeometry(1.05, 0.2, 0.8);
  const saddle = new THREE.Mesh(saddleGeo, saddleMat);
  saddle.position.set(0, 2.65, 0.4);
  group.add(saddle);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 1.4, 0.2);
  legGeo.translate(0, -0.7, 0); // Pivot at top
  const legs = [];
  const legOffsets = [ [-0.4, 1.4, 0.7], [0.4, 1.4, 0.7], [-0.4, 1.4, -0.7], [0.4, 1.4, -0.7] ];
  
  legOffsets.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, furMat);
    leg.position.set(...pos);
    group.add(leg);
    legs.push(leg);
  });

  const seat = new THREE.Object3D();
  seat.position.set(0, config.cameraY, 0.4);
  group.add(seat);

  let phase = 0;

  return {
    group,
    seat,
    update: (dt, speed, steer) => {
      if (Math.abs(speed) > 0.1) {
        phase += speed * dt * 3;
        // Pacing gait: same side legs move together
        const s = Math.sin(phase) * 0.5;
        legs[0].rotation.x = s;  // Front Left
        legs[2].rotation.x = s;  // Back Left
        legs[1].rotation.x = -s; // Front Right
        legs[3].rotation.x = -s; // Back Right
        
        // Body bob
        body.position.y = Math.abs(Math.cos(phase)) * 0.1;
        neck.rotation.x = (Math.PI / 6) + Math.sin(phase) * 0.1;
      }
    },
    dispose: () => {
      [bodyGeo, humpGeo, neckGeo, headGeo, saddleGeo, legGeo].forEach(g => g.dispose());
      [furMat, saddleMat].forEach(m => m.dispose());
    }
  };
}