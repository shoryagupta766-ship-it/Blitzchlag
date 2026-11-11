// src/game/hud/HUD.js
import { state } from '../utils/state.js';
import { Speedometer } from './Speedometer.js';
import { DestinationIndex } from './DestinationIndex.js';
import { ControlsHint } from './ControlsHint.js';
import { SkipMenu } from './SkipMenu.js';
import { events } from '../utils/events.js';
import { FEST } from '../config.js';

export class HUD {
  constructor(container, audioManager) {
    this._audio = audioManager;
    this._lastUpdate = 0;
    
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'blitz-hud';
    
    // Top Left: Logo Plate
    this.logo = document.createElement('div');
    this.logo.className = 'hud-logo-plate';
    this.logo.innerHTML = `<h1>${FEST.name}</h1><p>${FEST.tagline}<br/>${FEST.hashtag}</p>`;
    this.wrapper.appendChild(this.logo);

    // Bottom Right Buttons
    this.btnGroup = document.createElement('div');
    this.btnGroup.className = 'hud-btn-group';

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'hud-btn';
    this.muteBtn.setAttribute('aria-label', 'Toggle Mute');
    this.muteBtn.textContent = state.muted ? '🔇' : '🔊';
    this.muteBtn.onclick = () => {
      const isMuted = this._audio.toggleMute();
      this.muteBtn.textContent = isMuted ? '🔇' : '🔊';
    };

    this.skipBtn = document.createElement('button');
    this.skipBtn.className = 'hud-btn hud-btn-skip';
    this.skipBtn.textContent = 'SKIP GAME';
    
    this.btnGroup.appendChild(this.muteBtn);
    this.btnGroup.appendChild(this.skipBtn);
    this.wrapper.appendChild(this.btnGroup);

    // Zone Toast
    this.toast = document.createElement('div');
    this.toast.className = 'hud-zone-toast';
    this.wrapper.appendChild(this.toast);
    
    events.on('zone:change', (label) => {
      this.toast.textContent = `NOW ENTERING: ${label.toUpperCase()}`;
      this.toast.classList.add('show');
      setTimeout(() => this.toast.classList.remove('show'), 3000);
    });

    // Sub-components
    this.speedometer = new Speedometer(this.wrapper);
    this.index = new DestinationIndex(this.wrapper);
    this.controls = new ControlsHint(this.wrapper);
    this.skipMenu = new SkipMenu(this.wrapper, this.skipBtn);

    container.appendChild(this.wrapper);
  }

  update(dt) {
    this.controls.update(dt, state.speed);

    // Throttle DOM updates to 10Hz (every 100ms)
    const now = performance.now();
    if (now - this._lastUpdate < 100) return;
    this._lastUpdate = now;

    this.speedometer.update(state.speed);
    this.index.update();
  }

  dispose() {
    this.skipMenu.dispose();
    if (this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}