// src/game/utils/placement.js
// Calculates local coordinate frames along the CatmullRomCurve3.

import * as THREE from 'three';

export function getRoadFrame(curve, t) {
  const point = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
  return { point, tangent, up, right };
}

export function placeBeside(curve, t, lateral) {
  const frame = getRoadFrame(curve, t);
  const position = new THREE.Vector3().copy(frame.point)
    .add(frame.right.clone().multiplyScalar(lateral));
  
  // Angle facing parallel to the road
  const angleY = Math.atan2(frame.tangent.x, frame.tangent.z);
  
  // Angle rotated to face the road directly
  const faceRoad = angleY + (lateral > 0 ? Math.PI / 2 : -Math.PI / 2);
  
  return { position, angleY, faceRoad, frame };
}