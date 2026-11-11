// src/game/destinations/DestinationManager.js
// Orchestrates markers, proximity checks, inputs, and events.

import { DESTINATIONS } from '../config.js';
import { events } from '../utils/events.js';
import { placeBeside } from '../utils/placement.js';
import { DestinationMarker } from './DestinationMarker.js';
import { ProximityPrompt } from './ProximityPrompt.js';
import { FlyIn } from './FlyIn.js';

export class DestinationManager {
  constructor(scene, camera, curve, input, container, zoneBuilders) {
    this._scene = scene;
    this._curve = curve;
    this._curveLength = curve.getLength();
    this._input = input;
    
    this._markers = [];
    this._prompt = new ProximityPrompt(container);
    this._flyIn = new FlyIn(camera);
    
    this._activeDest = null;
    this._isEntering = false;
    
    const visitedState = JSON.parse(sessionStorage.getItem('blitz.visited') || '[]');

    DESTINATIONS.forEach(dest => {
      // Find anchor from ZoneBuilders, fallback to placeBeside
      let anchor = null;
      zoneBuilders.forEach(zb => {
        zb._children.forEach(child => {
          if (child.anchor && Math.abs(this._curve.getPointAt(dest.t).distanceTo(child.anchor.position)) < 50) {
            anchor = child.anchor;
          }
        });
      });
      if (!anchor) anchor = { position: placeBeside(curve, dest.t, 14).position, facing: 0 };

      const isVisited = visitedState.includes(dest.id);
      this._markers.push(new DestinationMarker(scene, dest, anchor, isVisited));
    });

    this._prompt.onTouch = () => {
      if (this._activeDest && !this._isEntering) this._triggerEntry(this._activeDest);
    };
  }

  update(dt, t, cameraPos) {
    if (this._isEntering) return;

    this._markers.forEach(m => m.update(dt, cameraPos));

    // Convert parametric distance to world units
    let nearest = null;
    let minWorldDist = Infinity;

    this._markers.forEach(marker => {
      const dtParam = Math.abs(t - marker.dest.t);
      const worldDist = dtParam * this._curveLength;
      if (worldDist < 14 && worldDist < minWorldDist) {
        minWorldDist = worldDist;
        nearest = marker;
      }
    });

    if (nearest && nearest.dest !== this._activeDest) {
      this._activeDest = nearest.dest;
      this._prompt.show(nearest.dest);
      events.emit('proximity:change', nearest.dest);
    } else if (!nearest && this._activeDest) {
      this._activeDest = null;
      this._prompt.hide();
      events.emit('proximity:change', null);
    }

    if (this._activeDest && this._input.consumePressed('interact')) {
      this._triggerEntry(this._activeDest);
    }
  }

  _triggerEntry(dest) {
    if (dest.hash === null) return; // START line has no route
    this._isEntering = true;
    this._prompt.hide();
    
    // Save state
    const visited = JSON.parse(sessionStorage.getItem('blitz.visited') || '[]');
    if (!visited.includes(dest.id)) {
      visited.push(dest.id);
      sessionStorage.setItem('blitz.visited', JSON.stringify(visited));
      events.emit('destination:visited', dest.id);
    }
    
    const targetMarker = this._markers.find(m => m.dest.id === dest.id);
    
    events.emit('destination:enter', dest);
    
    this._flyIn.execute(dest, targetMarker.group, () => {
      window.location.hash = dest.hash;
    });
  }

  getNearest(t) {
    return DESTINATIONS.reduce((prev, curr) => 
      Math.abs(curr.t - t) < Math.abs(prev.t - t) ? curr : prev
    );
  }

  dispose() {
    this._markers.forEach(m => m.dispose());
    this._prompt.dispose();
    this._flyIn.dispose();
  }
}