// src/game/destinations/ProximityPrompt.js
// DOM Overlay mapping "Press E" or a Touch button for interaction.

import { isTouchDevice } from '../utils/perf.js';

export class ProximityPrompt {
  constructor(container) {
    this._container = container;
    this._element = document.createElement('div');
    this._element.className = 'proximity-prompt';
    
    // Z-index safely below HUD (11) and cursor (9998)
    Object.assign(this._element.style, {
      position: 'absolute',
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '8000',
      display: 'none',
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#fff',
      background: 'rgba(0,0,0,0.75)',
      padding: '12px 24px',
      border: '2px solid #D4A017',
      borderRadius: '8px',
      pointerEvents: 'auto',
      cursor: 'pointer',
      textAlign: 'center'
    });

    this._element.setAttribute('aria-live', 'polite');
    this._container.appendChild(this._element);

    this.onTouch = null;
    this._element.addEventListener('click', () => {
      if (this.onTouch) this.onTouch();
    });
  }

  show(dest) {
    if (this._element.style.display === 'block') return;
    
    if (dest.hash === null) {
      this._element.innerHTML = `WELCOME TO BLITZSCHLAG 2027!<br><span style="font-size:14px; color:#aaa;">Drive forward to explore</span>`;
      this._element.style.pointerEvents = 'none';
    } else {
      const action = isTouchDevice() ? 'TAP HERE' : 'PRESS E';
      this._element.innerHTML = `<b>${action} TO ENTER</b><br><span style="color:#D4A017">${dest.name} AT ${dest.landmark.toUpperCase()}</span>`;
      this._element.style.pointerEvents = 'auto';
    }
    this._element.style.display = 'block';
  }

  hide() {
    this._element.style.display = 'none';
  }

  dispose() {
    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
  }
}