// src/game/config.js

export const FEST = {
  name:     'BLITZSCHLAG',
  tagline:  "MNIT Jaipur's Annual Cultural Fest",
  year:     2027,
  hashtag:  '#Blitzschlag27',
};

export const PALETTE = {
  sandstone:   0xE8C5A0,   
  mustard:     0xD4A017,   
  maroon:      0x5B1A1A,   
  nightSky:    0x0A0E2A,   
  fogDay:      0xF5E6D3,   
  fogNight:    0x0A0E2A,   
  road:        0x4A4A4A,   
  roadLine:    0xFFFFFF,   
  accent:      0xFFD400,   
  ground:      0xC8A882,   
  post:        0xB8860B,   
  glassBlue:   0x3B7A9E,   
  concrete:    0xD0C8B8,   
  darkSteel:   0x2C3539,   
};

export const ROAD = {
  width:           8,
  segments:        600,            
  curvePoints: [
    [  0,  0,     0],              
    [ 15,  0,  -120],              
    [ 50,  0,  -250],              
    [ 35,  1,  -400],              
    [-15,  3,  -550],              
    [-35,  2,  -700],              
    [-10,  1,  -820],              
    [  0,  0,  -900],              
  ],
  curveType:       'catmullrom',
  curveTension:    0.3,
  postSpacing:     15,             
  postHeight:      0.8,
  postRadius:      0.08,
};

export const ZONES = [
  {
    id:         'new-jaipur',
    label:      'New Jaipur',
    tStart:     0.00,
    tEnd:       0.35,
    fogColor:   0xF5E6D3,
    skyTop:     0xFDB777,          
    skyBottom:  0xF5E6D3,          
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
    skyTop:     0xD47A3A,          
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
    skyTop:     0x0A0E2A,          
    skyBottom:  0x1A1040,          
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

export const ZONE_A = {
  buildingMinOffset: 9,
  buildingMaxOffset: 22,
  buildingMinHeight: 8,
  buildingMaxHeight: 30,
  billboardOffset:   7.5,
  mnitGateT:         0.006,
  wtpT:              0.12,
  pacificMallT:      0.28,
};

export const DESTINATIONS = [
  { id: 1, name: 'START',        landmark: 'MNIT Gate',     t: 0.00,  hash: null },
  { id: 2, name: 'PASSES',       landmark: 'WTP',           t: 0.12,  hash: '#/passes' },
  { id: 3, name: 'EVENTS',       landmark: 'Pacific Mall',  t: 0.28,  hash: '#/events' },
  { id: 4, name: 'COMPETITIONS', landmark: 'Old-City Gate', t: 0.55,  hash: '#/competitions' },
  { id: 5, name: 'CONTACT',      landmark: 'Hawa Mahal',    t: 0.95,  hash: '#/contact' },
];

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

export const PERFORMANCE = {
  maxPixelRatio:   2,
  targetFPS:       60,
  maxDrawCalls:    150,
  maxTriangles:    300_000,
  chunkRadius:     200,
  lodDistances:    [50, 150],
};

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

export const CAMERA = {
  fov:             65,
  near:            0.5,
  far:             500,
  followDistance:   10,            
  followHeight:    4,             
  lookAheadT:      0.008,         
  lerpSpeed:       0.06,          
  parallaxStrength: 0.4,          
};

export const SCROLL = {
  wheelSensitivity: 0.00012,      
  touchSensitivity: 0.0008,       
  maxT:             0.998,        
};