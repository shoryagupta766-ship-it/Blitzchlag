// src/game/hud/Speedometer.js
export class Speedometer {
  constructor(parent) {
    this.el = document.createElement('div');
    this.el.className = 'hud-speedometer';
    
    this.num = document.createElement('div');
    this.num.className = 'speed-num';
    this.num.textContent = '0';
    
    const label = document.createElement('div');
    label.className = 'speed-label';
    label.textContent = 'KM/H';

    this.bar = document.createElement('div');
    this.bar.className = 'speed-bar';
    this.barFill = document.createElement('div');
    this.barFill.className = 'speed-bar-fill';
    this.bar.appendChild(this.barFill);

    this.el.appendChild(this.num);
    this.el.appendChild(label);
    this.el.appendChild(this.bar);
    parent.appendChild(this.el);
  }

  update(speed) {
    const kmh = Math.max(0, Math.round(speed * 3.6));
    this.num.textContent = kmh;
    
    const fillPercent = Math.min(100, (kmh / 120) * 100);
    this.barFill.style.transform = `scaleX(${fillPercent / 100})`;
  }
}