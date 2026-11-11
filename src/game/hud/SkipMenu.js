// src/game/hud/SkipMenu.js
import { DESTINATIONS } from '../config.js';

export class SkipMenu {
  constructor(parent, triggerBtn) {
    this.parent = parent;
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'skip-menu-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'skip-menu-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-label', 'Skip to Page');

    dialog.innerHTML = `<h2>SKIP DRIVING</h2><p>Go directly to a fest page:</p>`;
    
    const list = document.createElement('div');
    list.className = 'skip-menu-list';
    
    DESTINATIONS.filter(d => d.hash).forEach(d => {
      const a = document.createElement('a');
      a.href = d.hash;
      a.className = 'skip-menu-link';
      a.textContent = d.name;
      list.appendChild(a);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'hud-btn';
    closeBtn.textContent = 'CLOSE';
    closeBtn.onclick = () => this.hide();

    dialog.appendChild(list);
    dialog.appendChild(closeBtn);
    this.overlay.appendChild(dialog);
    this.parent.appendChild(this.overlay);

    triggerBtn.onclick = () => this.show();
    
    this._handleKey = (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('show')) this.hide();
    };
    window.addEventListener('keydown', this._handleKey);
  }

  show() {
    this.overlay.classList.add('show');
  }

  hide() {
    this.overlay.classList.remove('show');
  }

  dispose() {
    window.removeEventListener('keydown', this._handleKey);
    if (this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  }
}