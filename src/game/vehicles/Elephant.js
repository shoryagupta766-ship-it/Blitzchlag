// src/game/vehicles/Elephant.js
import * as THREE from 'three';
import { PALETTE } from '../config.js';

export function createElephant(config) {
  const group = new THREE.Group();
  
  const skinMat = new THREE.MeshLambertMaterial({ color: config.color });
  const jhoolMat = new THREE.MeshLambertMaterial({ color: PALETTE.maroon });
  const tuskMat = new THREE.MeshLambertMaterial({ color: 0xFFFDD0 });

  // Body & Head
  const bodyGeo = new THREE.BoxGeometry(2.0, 2.2, 3.2);
  bodyGeo.translate(0, 2.2, 0);
  const body = new THREE.Mesh(bodyGeo, skinMat);
  group.add(body);

  const headGeo = new THREE.BoxGeometry(1.6, 1.8, 1.6);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 2.6, 2.0);
  group.add(head);

  // Ears
  const earGeo = new THREE.BoxGeometry(0.2, 1.6, 1.2);
  earGeo.translate(-0.1, 0, -0.6); // pivot
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.8, 2.8, 2.2);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.8, 2.8, 2.2);
  rightEar.scale.x = -1;
  group.add(leftEar, rightEar);

  // Trunk (4 segments)
  const trunkParts = [];
  const trunkGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4);
  trunkGeo.translate(0, -0.3, 0);
  let parent = head;
  for(let i=0; i<4; i++) {
    const p = new THREE.Mesh(trunkGeo, skinMat);
    p.position.set(0, i === 0 ? -0.4 : -0.5, i === 0 ? 0.8 : 0);
    p.scale.setScalar(1 - (i * 0.15));
    parent.add(p);
    trunkParts.push(p);
    parent = p;
  }

  // Tusks
  const tuskGeo = new THREE.ConeGeometry(0.1, 1.2, 4);
  tuskGeo.rotateX(Math.PI / 2);
  const lTusk = new THREE.Mesh(tuskGeo, tuskMat);
  lTusk.position.set(-0.5, -0.2, 0.8);
  const rTusk = new THREE.Mesh(tuskGeo, tuskMat);
  rTusk.position.set(0.5, -0.2, 0.8);
  head.add(lTusk, rTusk);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.6, 1.4, 0.6);
  legGeo.translate(0, -0.7, 0);
  const legs = [];
  const legOffsets = [ [-0.7, 1.4, 1.2], [0.7, 1.4, 1.2], [-0.7, 1.4, -1.2], [0.7, 1.4, -1.2] ];
  legOffsets.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(...pos);
    group.add(leg);
    legs.push(leg);
  });

  // Howdah (Seat)
  const howdahGeo = new THREE.BoxGeometry(1.6, 0.4, 1.8);
  const howdah = new THREE.Mesh(howdahGeo, jhoolMat);
  howdah.position.set(0, 3.5, -0.2);
  group.add(howdah);

  const seat = new THREE.Object3D();
  seat.position.set(0, config.cameraY, -0.2);
  group.add(seat);

  let phase = 0;
  let lastSign = 1;
  let shakeTrigger = false;

  return {
    group,
    seat,
    get shakeImpulse() {
      if (shakeTrigger) { shakeTrigger = false; return 1.0; }
      return 0;
    },
    update: (dt, speed, steer) => {
      // Ears flap slowly
      const earTime = performance.now() * 0.001;
      leftEar.rotation.y = Math.sin(earTime * 2) * 0.3;
      rightEar.rotation.y = Math.sin(earTime * 2) * 0.3;

      if (Math.abs(speed) > 0.1) {
        phase += speed * dt * 2.5;
        const s = Math.sin(phase);
        
        legs[0].rotation.x = s * 0.3;
        legs[3].rotation.x = s * 0.3;
        legs[1].rotation.x = -s * 0.3;
        legs[2].rotation.x = -s * 0.3;
        
        // Trunk sway
        trunkParts.forEach((p, i) => p.rotation.x = (Math.PI / 16) + Math.sin(phase - i) * 0.1);

        // Shake on step
        const sign = Math.sign(s);
        if (sign !== lastSign) {
          shakeTrigger = true;
          lastSign = sign;
        }
      }
    },
    dispose: () => {
      [bodyGeo, headGeo, earGeo, trunkGeo, tuskGeo, legGeo, howdahGeo].forEach(g => g.dispose());
      [skinMat, jhoolMat, tuskMat].forEach(m => m.dispose());
    }
  };
}