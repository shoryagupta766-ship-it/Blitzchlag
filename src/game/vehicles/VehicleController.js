// src/game/vehicles/VehicleController.js
import { ROAD, SCROLL } from '../config.js';
import { getRoadFrame } from '../utils/placement.js';

const BASE_SPEED = 22;

export class VehicleController {
  constructor(curve) {
    this._curve = curve;
    this._curveLength = curve.getLength();
    this.t = 0.00;
    this.lateral = 0;
    this.speed = 0;
    this.steer = 0;
    this._scrollMomentum = 0;
  }

  getHalfWidthAt(t) {
    // Widen into a circular plaza at the finale
    if (t > 0.92) {
      const progress = Math.min(1, (t - 0.92) / 0.04);
      return ((ROAD.width / 2) - 0.9) + (progress * 15);
    }
    return (ROAD.width / 2) - 0.9;
  }

  update(dt, input, vehicleConfig) {
    let targetSpeed = 0;
    if (input.isDown('forward')) targetSpeed = BASE_SPEED * vehicleConfig.speed;
    if (input.isDown('brake')) targetSpeed = -BASE_SPEED * 0.5;
    if (input.isDown('boost') && targetSpeed > 0) targetSpeed *= 1.7;

    const scrollDelta = input.consumeScrollDelta();
    if (scrollDelta !== 0) this._scrollMomentum += scrollDelta * 0.05;
    this._scrollMomentum *= 0.9;
    targetSpeed += this._scrollMomentum;

    this.speed += (targetSpeed - this.speed) * 4 * dt;
    if (Math.abs(this.speed) < 0.1 && targetSpeed === 0) this.speed = 0;

    const deltaT = (this.speed * dt) / this._curveLength;
    this.t = Math.max(0, Math.min(SCROLL.maxT, this.t + deltaT));

    const speedFactor = Math.min(1, Math.abs(this.speed) / (BASE_SPEED * 0.5));
    let targetSteer = 0;
    if (input.isDown('steerLeft')) targetSteer = 1;
    if (input.isDown('steerRight')) targetSteer = -1;
    
    this.steer += (targetSteer - this.steer) * 8 * dt;
    
    if (speedFactor > 0.01) {
      const latSpeed = 12 * vehicleConfig.steerRate * this.steer * speedFactor * dt;
      this.lateral += latSpeed;
      const maxLat = this.getHalfWidthAt(this.t);
      this.lateral = Math.max(-maxLat, Math.min(maxLat, this.lateral));
    }
    return this.getTransform();
  }

  getTransform() {
    const frame = getRoadFrame(this._curve, this.t);
    const pos = frame.point.clone().add(frame.right.clone().multiplyScalar(-this.lateral));
    let yaw = Math.atan2(frame.tangent.x, frame.tangent.z);
    yaw += this.steer * 0.15; 
    return { position: pos, rotationY: yaw, frame };
  }
}