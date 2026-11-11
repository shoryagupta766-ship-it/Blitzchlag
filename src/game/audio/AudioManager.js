// src/game/audio/AudioManager.js
// Handles Web Audio context, unlocking on gesture, and vehicle sounds.

import { state } from '../utils/state.js';
import { VEHICLES } from '../config.js';

export class AudioManager {
  constructor() {
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._unlocked = false;
    this._buffers = new Map();
    this._sources = new Map();
    this._gainNodes = new Map();
    this._masterGain = this._ctx.createGain();
    this._masterGain.connect(this._ctx.destination);
    
    this._applyMuteState();

    this._unlockHandler = () => this._unlock();
    window.addEventListener('click', this._unlockHandler, { once: true });
    window.addEventListener('keydown', this._unlockHandler, { once: true });
    window.addEventListener('touchstart', this._unlockHandler, { once: true });

    // Preload sounds
    VEHICLES.forEach(v => {
      if (v.sfx) this._loadSound(v.sfx);
    });
  }

  _unlock() {
    if (this._unlocked) return;
    this._ctx.resume().then(() => {
      this._unlocked = true;
    });
    window.removeEventListener('click', this._unlockHandler);
    window.removeEventListener('keydown', this._unlockHandler);
    window.removeEventListener('touchstart', this._unlockHandler);
  }

  async _loadSound(name) {
    try {
      const response = await fetch(`/audio/${name}.mp3`);
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._ctx.decodeAudioData(arrayBuffer);
      this._buffers.set(name, audioBuffer);
    } catch (e) {
      console.warn(`AudioManager: Failed to load ${name}`, e);
    }
  }

  _applyMuteState() {
    this._masterGain.gain.value = state.muted ? 0 : 1;
  }

  toggleMute() {
    state.muted = !state.muted;
    localStorage.setItem('blitz.muted', state.muted);
    this._applyMuteState();
    return state.muted;
  }

  playThud() {
    if (!this._unlocked || state.muted) return;
    const buffer = this._buffers.get('heavy-thud');
    if (!buffer) return;
    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this._masterGain);
    source.start(0);
  }

  update(activeVehicleConfig, speed) {
    if (!this._unlocked) return;

    // Handle Engine / Bell loops
    const targetSfx = activeVehicleConfig?.sfx;
    
    // Stop unrelated looping sounds
    for (const [name, source] of this._sources.entries()) {
      if (name !== targetSfx || name === 'heavy-thud') {
        const gain = this._gainNodes.get(name);
        if (gain) gain.gain.setTargetAtTime(0, this._ctx.currentTime, 0.1);
      }
    }

    if (!targetSfx || targetSfx === 'heavy-thud') return;

    // Start or update active looping sound
    if (!this._sources.has(targetSfx) && this._buffers.has(targetSfx)) {
      const source = this._ctx.createBufferSource();
      source.buffer = this._buffers.get(targetSfx);
      source.loop = true;
      
      const gain = this._ctx.createGain();
      gain.gain.value = 0;
      
      source.connect(gain);
      gain.connect(this._masterGain);
      source.start(0);
      
      this._sources.set(targetSfx, source);
      this._gainNodes.set(targetSfx, gain);
    }

    const activeSource = this._sources.get(targetSfx);
    const activeGain = this._gainNodes.get(targetSfx);
    
    if (activeSource && activeGain) {
      const speedFactor = Math.min(1, Math.abs(speed) / 20);
      
      if (targetSfx === 'engine-putt') {
        activeSource.playbackRate.setTargetAtTime(0.8 + (speedFactor * 1.2), this._ctx.currentTime, 0.1);
        activeGain.gain.setTargetAtTime(speedFactor > 0.1 ? 0.8 : 0.2, this._ctx.currentTime, 0.1);
      } 
      else if (targetSfx === 'bell-jingle') {
        activeGain.gain.setTargetAtTime(speedFactor > 0.1 ? 1.0 : 0.0, this._ctx.currentTime, 0.1);
      }
    }
  }

  dispose() {
    this._sources.forEach(source => source.stop());
    this._ctx.close();
  }
}