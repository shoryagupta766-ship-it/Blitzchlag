// src/game/hud/ControlsHint.js
import { isTouchDevice } from '../utils/perf.js';

export class ControlsHint {
  constructor(parent) {
    this.el = document.createElement('div');
    this.el.className = 'hud-controls-hint';
    
    if (isTouchDevice()) {
      this.el.style.display = 'none';
    } else {
      this.el.innerHTML = `
        <span><b>W/A/S/D</b> DRIVE</span>
        <span><b>SHIFT</b> BOOST</span>
        <span><b>SPACE</b> BRAKE</span>
        <span><b>E</b> ENTER</span>
        <span><b>V</b> CAMERA</span>
        <span><b>1/2/3</b> VEHICLE</span>
      `;
    }
    
    parent.appendChild(this.el);
    
    this._idleTime = 0;
    this._isVisible = true;
  }

  update(dt, speed) {
    if (isTouchDevice()) return;

    if (Math.abs(speed) > 1) {
      this._idleTime = 0;
      if (this._isVisible) {
        setTimeout(() => {
          if (this._idleTime === 0) {
            this.el.classList.add('fade-out');
            this._isVisible = false;
          }
        }, 8000);
      }
    } else {
      this._idleTime += dt;
      if (!this._isVisible && this._idleTime > 6) {
        this.el.classList.remove('fade-out');
        this._isVisible = true;
      }
    }
  }
}