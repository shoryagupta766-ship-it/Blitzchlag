// src/game/utils/perf.js
import { PERFORMANCE } from '../config.js';

export function getDeviceTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 8;
  const isMobile = window.innerWidth <= 768 && isTouchDevice();
  
  // navigator.deviceMemory <= 4 catches older/budget phones.
  return (cores <= 4 || memory <= 4 || isMobile) ? 'low' : 'high';
}

export function getPixelRatio() {
  const tier = getDeviceTier();
  // Low tier gets locked to 1.0 pixel ratio for performance
  if (tier === 'low') return 1;
  return Math.min(window.devicePixelRatio || 1, PERFORMANCE.maxPixelRatio);
}

export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}