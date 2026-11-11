// src/game/world/ZoneBuilder.js
import * as THREE from 'three';
import { Buildings } from './zoneA/Buildings.js';
import { Billboards } from './zoneA/Billboards.js';
import { Flyover } from './zoneA/Flyover.js';
import { MnitGate } from '../landmarks/MnitGate.js';
import { WtpMall } from '../landmarks/WtpMall.js';
import { PacificMall } from '../landmarks/PacificMall.js';

// Lesson 4 Imports
import { SandstoneWalls } from './zoneB/SandstoneWalls.js';
import { Jharokhas } from './zoneB/Jharokhas.js';
import { Stalls } from './zoneB/Stalls.js';
import { Bunting } from './zoneB/Bunting.js';
import { OldCityGate } from '../landmarks/OldCityGate.js';
import { HawaMahal } from './zoneC/HawaMahal.js';
import { StreetLights } from './zoneC/StreetLights.js';
import { FestLights } from './zoneC/FestLights.js';
import { Fireworks } from './zoneC/Fireworks.js';

export class ZoneBuilder {
  constructor(scene, curve, zoneConfig, tier, cameraRig) {
    this._scene = scene;
    this.group = new THREE.Group();
    this.group.name = `Zone_${zoneConfig.id}`;
    this._children = [];
    this._build(curve, zoneConfig, tier, cameraRig);
    this._scene.add(this.group);
  }

  _build(curve, zoneConfig, tier, cameraRig) {
    for (const [key, config] of Object.entries(zoneConfig.assets)) {
      switch(key) {
        case 'buildings': this._children.push(new Buildings(this.group, curve, config, tier, zoneConfig)); break;
        case 'billboards': this._children.push(new Billboards(this.group, curve, config, zoneConfig)); break;
        case 'flyoverRails': this._children.push(new Flyover(this.group, curve, 0.20)); break;
        
        case 'walls': this._children.push(new SandstoneWalls(this.group, curve, config, tier, zoneConfig)); break;
        case 'jharokhas': this._children.push(new Jharokhas(this.group, curve, config, tier, zoneConfig)); break;
        case 'stalls': this._children.push(new Stalls(this.group, curve, config, zoneConfig)); break;
        case 'bunting': this._children.push(new Bunting(this.group, curve, zoneConfig)); break;
        
        case 'streetLights': this._children.push(new StreetLights(this.group, curve, config, zoneConfig)); break;
        case 'festLights': this._children.push(new FestLights(this.group, curve, zoneConfig)); break;
        case 'fireworks': this._children.push(new Fireworks(this.group, curve, tier)); break;
        
        default: console.debug(`ZoneBuilder: ignoring unknown asset key '${key}'`);
      }
    }

    // Landmarks
    if (zoneConfig.id === 'new-jaipur') {
      this._children.push(new MnitGate(this.group, curve, 0.006));
      this._children.push(new WtpMall(this.group, curve, 0.12, -14));
      this._children.push(new PacificMall(this.group, curve, 0.28, 14));
    }
    if (zoneConfig.id === 'old-city') {
      this._children.push(new OldCityGate(this.group, curve, 0.55));
    }
    if (zoneConfig.id === 'finale') {
      this._children.push(new HawaMahal(this.group, curve, 0.98));
    }
  }

  update(dt, t, cameraPos) {
    this._children.forEach(c => {
      if (c.update) c.update(dt, t, cameraPos);
    });
  }

  setActive(isActive) { this.group.visible = isActive; }
  
  setNightFactor(n) {
    this._children.forEach(c => { if (c.setNightFactor) c.setNightFactor(n); });
  }

  dispose() {
    this._scene.remove(this.group);
    this._children.forEach(c => { if (c.dispose) c.dispose(); });
    this._children = [];
  }
}