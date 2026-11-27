// Screenshot scenes: ?shot=<name>&seed=<n> builds a moment of a real run with the game's own
// code (world, render, HUD, screens) and draws it once, so the maker's screenshots are honest,
// repeatable renders. Names: title, farm, hide, barn, kitchen, caught, escaped.

import { PX_PER_METER } from './config.js';
import { createRun, step, DOOR_X } from './world.js';

const TICK = 1 / 120;

function runAt(seed, meters, stage) {
  const run = createRun(seed);
  run.turkey.wx = meters * PX_PER_METER;
  run.stage = stage;
  run.banner.t = 0;
  run.nextSpawnX = run.turkey.wx + 100000; // no random spawns: the scene is placed by hand
  return run;
}

function advance(run, seconds, controls) {
  for (let t = 0; t < seconds; t += TICK) step(run, TICK, controls);
  run.events.length = 0;
  run.shake = 0;
}

const SCENES = {
  title(game) { game.screen = 'title'; game.t = 2.5; game.best = 8975; },

  farm(game, seed) {
    const run = runAt(seed, 310, 0);
    const x = run.turkey.wx;
    run.entities.push(
      { type: 'crate', wx: x + 40, w: 46, h: 46 },
      { type: 'hay', wx: x + 300, w: 96, h: 58, used: false },
      { type: 'corn', wx: x + 150, y: 120, taken: false },
      { type: 'corn', wx: x + 194, y: 140, taken: false },
      { type: 'corn', wx: x + 238, y: 120, taken: false },
      { type: 'knifeFly', wx: x + 560, y: 46, vx: -260, whooshed: true },
    );
    Object.assign(run.turkey, { y: 96, vy: 260, onGround: false, lives: 3 });
    run.farmer.gap = 300; run.corn = 6; run.nearMisses = 2;
    advance(run, 0.12, { jump: true, fast: true });
    game.run = run; game.screen = 'play';
  },

  hide(game, seed) {
    const run = runAt(seed, 420, 0);
    const hay = { type: 'hay', wx: run.turkey.wx, w: 96, h: 58, used: false };
    run.entities.push(hay, { type: 'crate', wx: run.turkey.wx + 330, w: 46, h: 64 },
      { type: 'knifeFly', wx: run.turkey.wx + 520, y: 46, vx: -260, whooshed: true });
    run.turkey.hidden = hay; run.turkey.hideT = 1.1; run.turkey.lives = 2;
    run.farmer.gap = 170; run.corn = 9; run.nearMisses = 3;
    advance(run, 0.1, { duck: true });
    game.run = run; game.screen = 'play';
  },

  barn(game, seed) {
    const run = runAt(seed, 760, 1);
    const x = run.turkey.wx;
    run.entities.push(
      { type: 'crate', wx: x + 70, w: 46, h: 64 },
      { type: 'knifeDrop', wx: x + 300, y: 260, vy: -300, falling: true, stuck: false, trigger: 360 },
      { type: 'oven', wx: x + 520, phase: 0, period: 2.15, heat: 0, firing: false },
      { type: 'corn', wx: x + 200, y: 24, taken: false },
    );
    Object.assign(run.turkey, { y: 120, vy: 120, onGround: false, lives: 2 });
    run.farmer.gap = 190; run.corn = 11; run.nearMisses = 4; run.farmer.alert = 0.4;
    advance(run, 0.1, { jump: true });
    game.run = run; game.screen = 'play';
  },

  kitchen(game, seed) {
    const run = runAt(seed, 1480, 2);
    const x = run.turkey.wx;
    const period = 1.9;
    run.entities.push(
      { type: 'oven', wx: x + 175, phase: period - 0.45, period, heat: 0, firing: false },
      { type: 'knifeFly', wx: x + 450, y: 46, vx: -340, whooshed: true },
      { type: 'knifeDrop', wx: x + 610, y: 330, vy: -200, falling: true, stuck: false, trigger: 390 },
      { type: 'corn', wx: x + 290, y: 150, taken: false },
      { type: 'corn', wx: x + 334, y: 110, taken: false },
      { type: 'pie', wx: x + 520, y: 110, taken: false },
    );
    Object.assign(run.turkey, { y: 128, vy: 160, onGround: false, lives: 2 });
    run.farmer.gap = 112; run.corn = 17; run.nearMisses = 7; run.farmer.alert = 0.6;
    advance(run, 0.1, { jump: true, fast: true });
    run.pops.push({ text: 'CLOSE SHAVE! +25', color: '#fff4e0', wx: x - 30, y: 250, t: 0.9 });
    game.run = run; game.screen = 'play';
  },

  caught(game, seed) {
    const run = runAt(seed, 1310, 2);
    run.corn = 13; run.nearMisses = 5; run.sneaks = 1; run.bonus = 100;
    run.turkey.lives = 0; run.farmer.gap = 0;
    run.outcome = 'caught'; run.farmer.state = 'grab';
    advance(run, 2, {});
    game.run = run; game.screen = 'end'; game.best = 3120;
  },

  escaped(game, seed) {
    const run = runAt(seed, 1800, 2);
    run.turkey.wx = DOOR_X;
    run.corn = 22; run.nearMisses = 9; run.sneaks = 2; run.bonus = 200;
    run.turkey.lives = 2;
    run.outcome = null;
    step(run, TICK, {}); // crossing the door line finishes the run as escaped
    advance(run, 2, {});
    game.run = run; game.screen = 'end'; game.newBest = true; game.best = 4400;
  },
};

export function stageShot(name, seed, game) {
  (SCENES[name] || SCENES.title)(game, seed);
}
