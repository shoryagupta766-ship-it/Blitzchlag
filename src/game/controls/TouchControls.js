// src/game/controls/TouchControls.js
// Multi-touch virtual gamepad for mobile devices.

export class TouchControls {
  constructor(container, inputManager) {
    this._inputManager = inputManager;
    this._element = document.createElement('div');
    this._element.className = 'touch-controls-wrapper';
    
    // CSS layout mapping joystick left, boost right, safe-areas respected.
    Object.assign(this._element.style, {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 12, touchAction: 'none'
    });

    // Left Joypad Zone (Steering)
    this._joyZone = document.createElement('div');
    Object.assign(this._joyZone.style, {
      position: 'absolute', bottom: 'env(safe-area-inset-bottom, 20px)', left: 'env(safe-area-inset-left, 20px)',
      width: '150px', height: '150px', pointerEvents: 'auto'
    });

    this._joyBase = document.createElement('div');
    Object.assign(this._joyBase.style, {
      position: 'absolute', bottom: '20px', left: '20px', width: '100px', height: '100px',
      borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    this._joyThumb = document.createElement('div');
    Object.assign(this._joyThumb.style, {
      width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(212,160,23,0.8)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)', transition: 'transform 0.1s'
    });

    this._joyBase.appendChild(this._joyThumb);
    this._joyZone.appendChild(this._joyBase);

    // Right Boost/Brake Buttons
    this._btnZone = document.createElement('div');
    Object.assign(this._btnZone.style, {
      position: 'absolute', bottom: 'env(safe-area-inset-bottom, 20px)', right: 'env(safe-area-inset-right, 20px)',
      display: 'flex', gap: '15px', pointerEvents: 'auto', padding: '20px'
    });

    this._boostBtn = this._createButton('BOOST', '#5B1A1A', '#D4A017');
    this._brakeBtn = this._createButton('BRAKE', 'rgba(0,0,0,0.5)', '#FFF');
    
    this._btnZone.appendChild(this._brakeBtn);
    this._btnZone.appendChild(this._boostBtn);

    // Rotate Hint (Visible only in portrait via CSS media query)
    this._rotateHint = document.createElement('div');
    this._rotateHint.className = 'rotate-phone-hint';
    Object.assign(this._rotateHint.style, {
      position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.8)', color: '#FFF', padding: '10px 20px', borderRadius: '20px',
      fontSize: '14px', fontFamily: 'sans-serif', pointerEvents: 'none', display: 'none'
    });
    this._rotateHint.innerHTML = '🔄 Rotate phone for better steering';

    this._element.appendChild(this._joyZone);
    this._element.appendChild(this._btnZone);
    this._element.appendChild(this._rotateHint);
    container.appendChild(this._element);

    this._bindEvents();
    this._checkOrientation();
    window.addEventListener('resize', () => this._checkOrientation());
  }

  _createButton(text, bg, border) {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      width: '64px', height: '64px', borderRadius: '50%', background: bg, border: `3px solid ${border}`,
      color: '#FFF', fontSize: '12px', fontWeight: 'bold', userSelect: 'none', touchAction: 'manipulation'
    });
    return btn;
  }

  _checkOrientation() {
    this._rotateHint.style.display = window.innerHeight > window.innerWidth ? 'block' : 'none';
  }

  _bindEvents() {
    let joyTouchId = null;
    const baseCenter = { x: 70, y: 70 }; // Relative center of joyBase
    const maxRadius = 40;

    // Joystick
    this._joyZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joyTouchId = touch.identifier;
      this._updateJoy(touch);
    });

    this._joyZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) {
          this._updateJoy(e.changedTouches[i]);
        }
      }
    });

    const resetJoy = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) {
          joyTouchId = null;
          this._joyThumb.style.transform = `translate(0px, 0px)`;
          this._inputManager.virtual.steer = 0;
        }
      }
    };
    this._joyZone.addEventListener('touchend', resetJoy);
    this._joyZone.addEventListener('touchcancel', resetJoy);

    // Boost Button
    this._boostBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._inputManager.virtual.boost = true; this._boostBtn.style.transform = 'scale(0.9)'; });
    this._boostBtn.addEventListener('touchend', (e) => { e.preventDefault(); this._inputManager.virtual.boost = false; this._boostBtn.style.transform = 'scale(1)'; });
    
    // Brake Button
    this._brakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this._inputManager.virtual.brake = true; this._brakeBtn.style.transform = 'scale(0.9)'; });
    this._brakeBtn.addEventListener('touchend', (e) => { e.preventDefault(); this._inputManager.virtual.brake = false; this._brakeBtn.style.transform = 'scale(1)'; });
  }

  _updateJoy(touch) {
    const rect = this._joyBase.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
    // Only track X axis for steering (1D steering wheel)
    let deltaX = touchX - 50; 
    deltaX = Math.max(-40, Math.min(40, deltaX)); // clamp to radius
    
    this._joyThumb.style.transform = `translate(${deltaX}px, 0px)`;
    
    // Normalize to -1 (right) to 1 (left) to match keyboard steering logic
    this._inputManager.virtual.steer = -(deltaX / 40); 
  }

  dispose() {
    if (this._element.parentNode) this._element.parentNode.removeChild(this._element);
  }
}