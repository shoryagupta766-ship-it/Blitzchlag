// src/game/config.js
// ──────────────────────────────────────────────────────────────
// Single source of truth for the entire driving experience.
// Every magic number lives here — change this file, change the
// game. No hunting through 15 modules.
// ──────────────────────────────────────────────────────────────

/** Fest branding — used by the HUD and loader overlay. */
export const FEST = {
  name:     'BLITZSCHLAG',
  tagline:  "MNIT Jaipur's Annual Cultural Fest",
  year:     2027,
  hashtag:  '#Blitzschlag27',
};

/**
 * Colour palette — warm Jaipur tones.
 * All values are 0x-prefixed hex integers for THREE.Color.
 */
export const PALETTE = {
  sandstone:   0xE8C5A0,   // warm peach-pink sandstone
  mustard:     0xD4A017,   // mustard yellow
  maroon:      0x5B1A1A,   // deep maroon
  nightSky:    0x0A0E2A,   // navy night sky
  fogDay:      0xF5E6D3,   // soft golden-hour haze
  fogNight:    0x0A0E2A,   // night fog matches sky
  road:        0x4A4A4A,   // asphalt grey
  roadLine:    0xFFFFFF,   // white lane markings
  accent:      0xFFD400,   // highlights / UI gold
  ground:      0xC8A882,   // dusty terrain
  post:        0xB8860B,   // road bollard dark-gold
};

/**
 * Road geometry — the CatmullRomCurve3 backbone of the game.
 * curvePoints are [x, y, z] knots; the spline runs ~900 world-units.
 * y gives gentle elevation; x/z create the winding S-curve.
 */
export const ROAD = {
  width:           8,
  segments:        600,            // triangulation density along the curve
  curvePoints: [
    [  0,  0,     0],              // 0  – MNIT gate (START)
    [ 15,  0,  -120],              // gentle right toward WTP
    [ 50,  0,  -250],              // WTP / Pacific Mall zone
    [ 35,  1,  -400],              // transition into old city
    [-15,  3,  -550],              // old-city gate (slight climb)
    [-35,  2,  -700],              // bazaar stretch
    [-10,  1,  -820],              // approaching finale
    [  0,  0,  -900],              // Hawa Mahal square (END)
  ],
  curveType:       'catmullrom',
  curveTension:    0.3,
  postSpacing:     15,             // world-units between road bollards
  postHeight:      0.8,
  postRadius:      0.08,
};

/**
 * Zones — three aesthetic regions of the road.
 * tStart/tEnd are parametric positions on the curve (0–1).
 * Colors transition as the player drives from day to night.
 */
export const ZONES = [
  {
    id:         'new-jaipur',
    label:      'New Jaipur',
    tStart:     0.00,
    tEnd:       0.35,
    fogColor:   0xF5E6D3,
    skyTop:     0xFDB777,          // warm amber sky
    skyBottom:  0xF5E6D3,          // golden haze at horizon
    sunColor:   0xFFF4E0,
    sunIntensity: 1.2,
    assets: {
      buildings:    { count: 40, style: 'modern' },
      billboards:   { count: 6 },
      flyoverRails: true,
    },
  },
  {
    id:         'old-city',
    label:      'Old City',
    tStart:     0.35,
    tEnd:       0.75,
    fogColor:   0xD4956B,
    skyTop:     0xD47A3A,          // deepening orange
    skyBottom:  0xD4956B,
    sunColor:   0xFFBB77,
    sunIntensity: 0.8,
    assets: {
      walls:        { count: 20, style: 'sandstone' },
      arches:       { count: 5 },
      stalls:       { count: 15 },
      bunting:      true,
      jharokhas:    { count: 8 },
    },
  },
  {
    id:         'finale',
    label:      'Hawa Mahal Square',
    tStart:     0.75,
    tEnd:       1.00,
    fogColor:   0x0A0E2A,
    skyTop:     0x0A0E2A,          // deep navy night
    skyBottom:  0x1A1040,          // faint purple horizon
    sunColor:   0x8888CC,
    sunIntensity: 0.3,
    assets: {
      hawaMahal:    true,
      streetLights: { count: 12 },
      fireworks:    true,
      festLights:   true,
    },
  },
];

/**
 * Destinations — the 5 "stops" on the Jaipur journey.
 * `t` is the curve position; `hash` is the page route.
 * null hash means no navigation (the start/welcome point).
 */
export const DESTINATIONS = [
  { id: 1, name: 'START',        landmark: 'MNIT Gate',     t: 0.00,  hash: null },
  { id: 2, name: 'PASSES',       landmark: 'WTP',           t: 0.12,  hash: '#/passes' },
  { id: 3, name: 'EVENTS',       landmark: 'Pacific Mall',  t: 0.28,  hash: '#/events' },
  { id: 4, name: 'COMPETITIONS', landmark: 'Old-City Gate', t: 0.55,  hash: '#/competitions' },
  { id: 5, name: 'CONTACT',      landmark: 'Hawa Mahal',    t: 0.95,  hash: '#/contact' },
];

/**
 * Vehicles — three rideable options, switchable with keys 1/2/3.
 * speed is a multiplier on the base scroll rate.
 * bob/shake params drive per-frame camera animation.
 */
export const VEHICLES = [
  {
    id:          'auto',
    name:        'Auto-Rickshaw',
    key:         '1',
    speed:       1.4,
    steerRate:   1.2,
    cameraY:     2.5,
    bobFreq:     0,
    bobAmp:      0,
    shakeOnStep: false,
    sfx:         'engine-putt',
    color:       0x2E8B57,
  },
  {
    id:          'camel',
    name:        'Camel',
    key:         '2',
    speed:       1.0,
    steerRate:   0.8,
    cameraY:     3.5,
    bobFreq:     1.8,
    bobAmp:      0.15,
    shakeOnStep: false,
    sfx:         'bell-jingle',
    color:       0xC4A35A,
  },
  {
    id:          'elephant',
    name:        'Elephant',
    key:         '3',
    speed:       0.6,
    steerRate:   0.5,
    cameraY:     5.0,
    bobFreq:     0.9,
    bobAmp:      0.08,
    shakeOnStep: true,
    sfx:         'heavy-thud',
    color:       0x808080,
  },
];

/**
 * Performance caps — hard limits that keep us inside the budget.
 */
export const PERFORMANCE = {
  maxPixelRatio:   2,
  targetFPS:       60,
  maxDrawCalls:    150,
  maxTriangles:    300_000,
  chunkRadius:     200,
  lodDistances:    [50, 150],
};

/**
 * Key-bindings — each action maps to one or more event.code values.
 * InputManager reads these; nothing else should hard-code keys.
 */
export const CONTROLS = {
  forward:     ['KeyW', 'ArrowUp'],
  brake:       ['KeyS', 'ArrowDown', 'Space'],
  steerLeft:   ['KeyA', 'ArrowLeft'],
  steerRight:  ['KeyD', 'ArrowRight'],
  boost:       ['ShiftLeft', 'ShiftRight'],
  interact:    ['KeyE'],
  toggleCam:   ['KeyV'],
  vehicle1:    ['Digit1'],
  vehicle2:    ['Digit2'],
  vehicle3:    ['Digit3'],
};

/**
 * Camera defaults — used by CameraRig / GameManager.
 */
export const CAMERA = {
  fov:             65,
  near:            0.5,
  far:             500,
  followDistance:   10,            // units behind the road point
  followHeight:    4,             // units above the road surface
  lookAheadT:      0.008,         // how far ahead on the curve the camera looks
  lerpSpeed:       0.06,          // smoothing factor for camera follow (0–1)
  parallaxStrength: 0.4,          // mouse-parallax intensity
};

/**
 * Scroll / movement tuning.
 */
export const SCROLL = {
  wheelSensitivity: 0.00012,      // deltaY → Δt on the curve
  touchSensitivity: 0.0008,       // touch-drag pixels → Δt
  maxT:             0.998,        // clamp before curve end (avoids NaN tangent)
};
