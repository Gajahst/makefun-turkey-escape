// Gobble Getaway: every tunable number and colour in one place.

export const VIEW = { w: 960, h: 540 };
export const GROUND_Y = 440;          // top of the ground strip, in screen pixels
export const PX_PER_METER = 40;
export const ESCAPE_METERS = 1800;    // reach this and the turkey is free

export const TURKEY = {
  x: 330,              // screen x the camera keeps the turkey at
  w: 54, h: 58,        // standing hitbox
  duckH: 30,           // ducking hitbox height
  gravity: 2300,
  jumpV: 860,
  jumpHoldBoost: 1500, // extra lift while the jump key is held on the way up
  baseSpeed: 300,      // px per second
  minSpeed: 210,
  maxSpeed: 430,
  accel: 520,
  dashSpeed: 640,
  dashTime: 0.32,
  dashCooldown: 2.4,
  invulnTime: 1.3,
  lives: 3,
  hideMax: 2.6,        // seconds the turkey can stay hidden in a hay bale
};

export const FARMER = {
  startGap: 260,       // world px between farmer and turkey at the start
  maxGap: 520,
  baseSpeed: 300,
  catchUpPerStage: 22, // farmer gets faster each stage
  hitLunge: 120,       // gap lost when the turkey is hit
  searchSlow: 0.35,    // farmer speed factor while searching for a hidden turkey
};

// Stages by distance (meters). Each changes the scenery and the danger mix.
export const STAGES = [
  { id: 'farm',    name: 'The Farmyard', from: 0,    spawnGap: [1.25, 1.9],
    mix: { crate: 3, hay: 3, knifeFly: 1, corn: 4 } },
  { id: 'barn',    name: 'The Big Barn', from: 550,  spawnGap: [1.0, 1.6],
    mix: { crate: 2, hay: 2, knifeFly: 2, knifeDrop: 2, oven: 1, corn: 3, pie: 0.5 } },
  { id: 'kitchen', name: 'The Kitchen',  from: 1150, spawnGap: [0.85, 1.35],
    mix: { oven: 3, knifeFly: 3, knifeDrop: 3, hay: 1, corn: 3, pie: 0.7 } },
];

export const SCORE = { corn: 50, nearMiss: 25, perMeter: 1, escapeBonus: 1000, lifeBonus: 300 };

export const PALETTE = {
  skyTop: '#f7b267', skyBottom: '#fde4c3',
  barnSkyTop: '#d9734a', barnSkyBottom: '#f4b183',
  kitchenWall: '#f3e1c7', kitchenTile: '#e9cfa9', kitchenTrim: '#9b4f2c',
  hillFar: '#d98c4a', hillNear: '#b8662f',
  grass: '#8a9a3b', grassDark: '#6c7a2a', dirt: '#8b5a2b', dirtDark: '#6b4220',
  floorBoards: '#a8673a', floorDark: '#7e4a27',
  turkeyBody: '#6b3f22', turkeyWing: '#4e2c16', turkeyHead: '#c9d6e3',
  wattle: '#d7263d', beak: '#f2a541',
  fan: ['#8c2f1b', '#c4541f', '#e8a33d', '#f4d58d'],
  farmerShirt: '#c0392b', farmerPlaid: '#7f1d1d', farmerJeans: '#2f4b7c',
  farmerSkin: '#f1c27d', farmerHat: '#d9b45a', beard: '#6b4a2b',
  ovenBody: '#3d3d46', ovenDoor: '#24242b', ovenGlow: '#ff7b1c',
  steel: '#d8dde3', steelDark: '#8d97a3', handle: '#5a3216',
  hay: '#e8c25a', hayDark: '#c69a32', crate: '#a8703a', crateDark: '#704520',
  corn: '#f5cd30', husk: '#7ea33a',
  ink: '#3a2414', cream: '#fff4e0', hudBack: 'rgba(58,36,20,0.72)',
  danger: '#e63b2e', good: '#5fae4b',
};
