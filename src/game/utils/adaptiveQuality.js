// src/game/utils/adaptiveQuality.js
// Monitors FPS over time and downgrades/upgrades visual settings to maintain performance.

export class AdaptiveQuality {
    constructor(renderer, chunkManager, fireworksManager) {
        this.renderer = renderer;
        this.chunkManager = chunkManager;
        this.fireworks = fireworksManager;
        
        this.frameCount = 0;
        this.lastCheck = performance.now();
        
        this.qualityLevel = 2; // 2: High, 1: Medium, 0: Low
        this.timeInCurrentLevel = 0;
    }

    update() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastCheck;

        // Check average FPS every 3 seconds
        if (elapsed >= 3000) {
            const fps = (this.frameCount * 1000) / elapsed;
            this.frameCount = 0;
            this.lastCheck = now;
            this.timeInCurrentLevel += elapsed;

            if (fps < 40 && this.qualityLevel > 0) {
                this.downgrade();
                this.timeInCurrentLevel = 0;
            } else if (fps > 58 && this.qualityLevel < 2 && this.timeInCurrentLevel > 10000) {
                // Upgrade only if we've been stable for 10 seconds (prevents flapping/hysteresis)
                this.upgrade();
                this.timeInCurrentLevel = 0;
            }
        }
    }

    downgrade() {
        this.qualityLevel--;
        console.log(`[AdaptiveQuality] Downgrading to level ${this.qualityLevel}`);
        this.applySettings();
    }

    upgrade() {
        this.qualityLevel++;
        console.log(`[AdaptiveQuality] Upgrading to level ${this.qualityLevel}`);
        this.applySettings();
    }

    applySettings() {
        if (this.qualityLevel === 2) {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.chunkManager.setRadius(200);
            if (this.fireworks) this.fireworks.active = true;
        } else if (this.qualityLevel === 1) {
            this.renderer.setPixelRatio(1);
            this.chunkManager.setRadius(140);
            if (this.fireworks) this.fireworks.active = true;
        } else if (this.qualityLevel === 0) {
            this.renderer.setPixelRatio(1);
            this.chunkManager.setRadius(100);
            if (this.fireworks) this.fireworks.active = false;
        }
    }
}