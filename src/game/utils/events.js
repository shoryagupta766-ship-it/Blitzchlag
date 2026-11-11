// src/game/utils/events.js
// Tiny Pub/Sub Event Bus for decoupled module communication.

class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach(callback => callback(data));
    }
  }

  clear() {
    this._listeners.clear();
  }
}

export const events = new EventBus();