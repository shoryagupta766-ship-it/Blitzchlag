// src/game/world/Atmosphere.js
import * as THREE from 'three';
import { ZONES } from '../config.js';

export class Atmosphere {
  constructor(scene, skybox, lighting) {
    this._scene = scene;
    this._skybox = skybox;
    this._lighting = lighting;
    
    this._colorCache = {
      skyTop: new THREE.Color(),
      skyBottom: new THREE.Color(),
      fog: new THREE.Color(),
      sun: new THREE.Color()
    };
  }

  update(t, zoneBuilders) {
    // Determine active zones for interpolation
    let zA = ZONES[0], zB = ZONES[0];
    let blend = 0;

    for (let i = 0; i < ZONES.length - 1; i++) {
      if (t >= ZONES[i].tStart && t <= ZONES[i+1].tEnd) {
        zA = ZONES[i];
        zB = ZONES[i+1];
        // Blend in the last 10% of a zone
        const transitionStart = zA.tEnd - 0.05;
        if (t > transitionStart) {
          blend = Math.min(1, (t - transitionStart) / 0.1);
        }
        break;
      }
    }

    this._colorCache.skyTop.setHex(zA.skyTop).lerp(new THREE.Color(zB.skyTop), blend);
    this._colorCache.skyBottom.setHex(zA.skyBottom).lerp(new THREE.Color(zB.skyBottom), blend);
    this._colorCache.fog.setHex(zA.fogColor).lerp(new THREE.Color(zB.fogColor), blend);
    this._colorCache.sun.setHex(zA.sunColor).lerp(new THREE.Color(zB.sunColor), blend);
    
    const intensity = zA.sunIntensity + (zB.sunIntensity - zA.sunIntensity) * blend;

    this._skybox.setColors(this._colorCache.skyTop, this._colorCache.skyBottom);
    this._scene.fog.color.copy(this._colorCache.fog);
    this._scene.background.copy(this._colorCache.fog);
    
    this._lighting.sun.color.copy(this._colorCache.sun);
    this._lighting.sun.intensity = intensity;
    this._lighting.hemi.color.copy(this._colorCache.sun);
    
    const nightFactor = (t > ZONES[1].tEnd - 0.1) ? Math.min(1, (t - (ZONES[1].tEnd - 0.1)) / 0.1) : 0;
    zoneBuilders.forEach(zb => zb.setNightFactor(nightFactor));
  }
}