// src/game/world/ChunkManager.js
// Handles distance-based visibility and Level of Detail (LOD).

import { PERFORMANCE } from '../config.js';

export class ChunkManager {
    constructor(curve, zoneBuilders) {
        this.curve = curve;
        this.curveLength = curve.getLength();
        this.zoneBuilders = zoneBuilders;
        
        this.radius = PERFORMANCE.chunkRadius; // World units
        this.hysteresis = 20; // World units buffer
        
        this.lodNear = PERFORMANCE.lodDistances[0];
        this.lodFar = PERFORMANCE.lodDistances[1];
    }

    setRadius(newRadius) {
        this.radius = newRadius;
    }

    update(t) {
        const currentWorldPos = t * this.curveLength;

        this.zoneBuilders.forEach(zb => {
            const startWorld = zb.zoneConfig.tStart * this.curveLength;
            const endWorld = zb.zoneConfig.tEnd * this.curveLength;
            
            // Distance from player to the closest point of the zone
            let distToZone = 0;
            if (currentWorldPos < startWorld) distToZone = startWorld - currentWorldPos;
            else if (currentWorldPos > endWorld) distToZone = currentWorldPos - endWorld;

            // 1. Chunk Culling with Hysteresis
            const isVisible = zb.group.visible;
            if (isVisible && distToZone > this.radius + this.hysteresis) {
                zb.setActive(false);
            } else if (!isVisible && distToZone <= this.radius) {
                zb.setActive(true);
            }

            // 2. Simple LOD toggle (hide windows/details if far)
            if (zb.group.visible) {
                zb._children.forEach(child => {
                    if (!child.meshes) return;
                    
                    // Simple distance check to the child's group position (if it has one)
                    let childWorldDist = distToZone; 
                    if (child.group && child.group.position) {
                        const playerPos = this.curve.getPointAt(t);
                        childWorldDist = playerPos.distanceTo(child.group.position);
                    }

                    if (childWorldDist > this.lodFar) {
                        // Mid/Far LOD: hide secondary details (like windows or bunting)
                        if (child.meshes[1]) child.meshes[1].visible = false;
                    } else {
                        // Near LOD: show everything
                        if (child.meshes[1]) child.meshes[1].visible = true;
                    }
                });
            }
        });
    }
}