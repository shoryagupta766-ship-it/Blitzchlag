// src/game/fallback/StaticSkyline.js
// 2D CSS/HTML fallback for low-end devices and strict accessibility preferences.

import { DESTINATIONS, FEST } from '../config.js';

export class StaticSkyline {
  constructor(container) {
    this._container = container;
    this._element = document.createElement('div');
    this._element.className = 'static-skyline-wrapper';
    
    Object.assign(this._element.style, {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'linear-gradient(to bottom, #FDB777, #F5E6D3)', // Golden hour
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', zIndex: 10, overflow: 'auto'
    });

    let linksHTML = DESTINATIONS.filter(d => d.hash).map(d => `
      <a href="${d.hash}" style="
        display: block; width: 100%; padding: 15px; margin-bottom: 10px;
        background: #5B1A1A; color: #FFF; text-decoration: none; font-size: 20px;
        text-align: center; border-radius: 8px; font-weight: bold; border: 2px solid #D4A017;
      ">${d.name}</a>
    `).join('');

    this._element.innerHTML = `
      <div style="max-width: 400px; width: 90%; padding: 20px; background: rgba(255,255,255,0.9); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h1 style="color: #5B1A1A; text-align: center; margin-top: 0;">${FEST.name}</h1>
        <p style="text-align: center; color: #333;">Select a destination:</p>
        ${linksHTML}
        <button id="force-3d-btn" style="
          width: 100%; padding: 12px; margin-top: 20px; background: transparent; 
          border: 2px solid #5B1A1A; color: #5B1A1A; border-radius: 8px; cursor: pointer;
        ">Play 3D Version Anyway</button>
      </div>
      <div style="position: absolute; bottom: 0; width: 100%; height: 120px; background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\" preserveAspectRatio=\"none\"><path d=\"M0,20 L0,10 Q25,0 50,10 T100,10 L100,20 Z\" fill=\"%23d98a72\" opacity=\"0.5\"/></svg>') stretch; pointer-events: none;"></div>
    `;

    this._container.appendChild(this._element);

    this._element.querySelector('#force-3d-btn').addEventListener('click', () => {
      localStorage.setItem('blitz.force3D', 'true');
      window.location.reload(); // Reloads to trigger scene3d initialization bypass
    });
  }

  dispose() {
    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
  }
}