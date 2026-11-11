// src/game/utils/state.js
// Plain state object representing the current frame's status.

export const state = {
  speed: 0,
  t: 0,
  zoneLabel: '',
  nearestDestination: null,
  visited: JSON.parse(sessionStorage.getItem('blitz.visited') || '[]'),
  muted: localStorage.getItem('blitz.muted') === 'true'
};