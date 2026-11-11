// src/game/controls/InputManager.js
// Centralizes keyboard, scroll, and touch. Reads from CONTROLS config.

import { CONTROLS } from '../config.js';

export class InputManager {
  constructor() {
    this._keys = new Set();
    this._justPressed = new Set();
    this._scrollDelta = 0;
    this._touchStartY = 0;
    // Virtual overrides from TouchControls.js
    this.virtual = { steer: 0, boost: false, brake: false };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onBlur = this._onBlur.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('blur', this._onBlur);
  }

  _isValidTarget(e) {
    const tag = e.target.tagName;
    return tag !== 'INPUT' && tag !== 'TEXTAREA';
  }

  _onKeyDown(e) {
    if (!this._isValidTarget(e)) return;
    if (e.code === 'Space') e.preventDefault(); // Stop page scroll
    
    if (!this._keys.has(e.code)) {
      this._justPressed.add(e.code);
    }
    this._keys.add(e.code);
  }

  _onKeyUp(e) {
    this._keys.delete(e.code);
  }

  _onWheel(e) {
    this._scrollDelta += e.deltaY;
  }

  _onTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
  }

  _onTouchMove(e) {
    const y = e.touches[0].clientY;
    this._scrollDelta -= (y - this._touchStartY) * 2; // scale touch to feel like scroll
    this._touchStartY = y;
  }

  _onBlur() {
    this._keys.clear();
    this._justPressed.clear();
  }

  _isValidTarget(e) { return e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'; }
  _onKeyDown(e) { 
    if (!this._isValidTarget(e)) return; 
    if (e.code === 'Space') e.preventDefault();
    if (!this._keys.has(e.code)) this._justPressed.add(e.code);
    this._keys.add(e.code);
  }
  _onKeyUp(e) { this._keys.delete(e.code); }
  _onWheel(e) { this._scrollDelta += e.deltaY; }
  _onTouchStart(e) { this._touchStartY = e.touches[0].clientY; }
  _onTouchMove(e) {
    const y = e.touches[0].clientY;
    this._scrollDelta -= (y - this._touchStartY) * 2;
    this._touchStartY = y;
  }
  _onBlur() { this._keys.clear(); this._justPressed.clear(); }

  isDown(actionName) {
    // Inject virtual touch axes directly into the boolean checks so VehicleController stays ignorant
    if (actionName === 'steerLeft' && this.virtual.steer > 0.2) return true;
    if (actionName === 'steerRight' && this.virtual.steer < -0.2) return true;
    if (actionName === 'boost' && this.virtual.boost) return true;
    if (actionName === 'brake' && this.virtual.brake) return true;
    if (actionName === 'forward') {
       // Auto-drive if joystick is actively being steered, OR boost is pressed
       if (Math.abs(this.virtual.steer) > 0.2 || this.virtual.boost) return true;
    }

    const codes = CONTROLS[actionName];
    return codes ? codes.some(code => this._keys.has(code)) : false;
  }

  consumePressed(actionName) {
    const codes = CONTROLS[actionName];
    if (!codes) return false;
    for (const code of codes) {
      if (this._justPressed.has(code)) {
        this._justPressed.delete(code);
        return true;
      }
    }
    return false;
  }

  consumeScrollDelta() {
    const d = this._scrollDelta;
    this._scrollDelta = 0;
    return d;
  }

  update() {
    this._justPressed.clear();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('blur', this._onBlur);
  }
}