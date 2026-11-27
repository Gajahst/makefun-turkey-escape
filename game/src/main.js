// Gobble Getaway: the game loop and the screens it moves between (title, play, pause, end).
// A fixed 120 Hz simulation tick keeps the run identical on fast and slow machines.

import { VIEW } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRun, step, scoreOf } from './world.js';
import { drawRun } from './render.js';
import { drawHud } from './hud.js';
import { drawTitle, drawPause, drawEnd } from './screens.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed')) || (Date.now() % 100000);

function fitCanvas() {
  const dpr = shot ? 1 : Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.w * dpr;
  canvas.height = VIEW.h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const input = createInput(canvas, VIEW);
const audio = createAudio();

function loadBest() { try { return Number(localStorage.getItem('gobble-getaway-best')) || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('gobble-getaway-best', String(v)); } catch { /* private mode */ } }

const game = { screen: 'title', run: null, t: 0, best: loadBest(), newBest: false, buttons: [], runs: 0 };

function startRun() {
  audio.unlock();
  game.runs++;
  game.run = createRun(seed + game.runs * 7919);
  game.screen = 'play';
  game.newBest = false;
  audio.play('gobble');
}

function doAction(action) {
  audio.play('click');
  if (action === 'start' || action === 'restart') startRun();
  else if (action === 'resume') game.screen = 'play';
  else if (action === 'title') game.screen = 'title';
}

function clickedButton() {
  if (!input.mouse.clicked) return null;
  const b = game.buttons.find((btn) => input.mouse.x > btn.x && input.mouse.x < btn.x + btn.w && input.mouse.y > btn.y && input.mouse.y < btn.y + btn.h);
  return b ? b.action : null;
}

const TICK = 1 / 120;
let acc = 0;
let last = performance.now();

function update(dt) {
  game.t += dt;
  if (input.wasPressed('mute')) audio.toggleMute();
  const clicked = clickedButton();

  if (game.screen === 'title') {
    if (clicked) doAction(clicked);
    else if (input.wasPressed('confirm') || (input.wasPressed('jump') && !input.mouse.clicked)) startRun();
    return;
  }
  if (game.screen === 'paused') {
    if (clicked) doAction(clicked);
    else if (input.wasPressed('pause')) game.screen = 'play';
    return;
  }
  const run = game.run;
  if (game.screen === 'play') {
    if (input.wasPressed('pause')) { game.screen = 'paused'; return; }
    acc += dt;
    let first = true;
    while (acc >= TICK) {
      step(run, TICK, {
        jump: input.isHeld('jump'),
        jumpPressed: first && input.wasPressed('jump'),
        duck: input.isHeld('duck'),
        slow: input.isHeld('slow'),
        fast: input.isHeld('fast'),
        dashPressed: first && input.wasPressed('dash'),
      });
      first = false;
      acc -= TICK;
    }
    for (const name of run.events) audio.play(name);
    run.events.length = 0;
    audio.updateMusic(dt, !run.outcome, run.stage / 2);
    if (run.outcome) {
      const score = scoreOf(run);
      if (score > game.best) { game.best = score; game.newBest = true; saveBest(score); }
      game.screen = 'end';
    }
    return;
  }
  if (game.screen === 'end') {
    step(run, dt, {});
    run.events.length = 0;
    if (clicked) doAction(clicked);
    else if (run.endT > 1 && (input.wasPressed('restart') || input.wasPressed('confirm') || (input.wasPressed('jump') && !input.mouse.clicked))) startRun();
    else if (input.wasPressed('pause')) game.screen = 'title';
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  game.buttons = [];
  if (game.screen === 'title') { game.buttons = drawTitle(ctx, game.t, input.mouse, game.best); return; }
  drawRun(ctx, game.run);
  if (game.screen !== 'end') drawHud(ctx, game.run, audio.muted);
  if (game.screen === 'paused') game.buttons = drawPause(ctx, input.mouse);
  if (game.screen === 'end') game.buttons = drawEnd(ctx, game.run, input.mouse, game.best, game.newBest);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

if (shot) {
  // Screenshot mode: build one scene from the game's own code and draw it once.
  stageShot(shot, seed, game);
  render();
  document.body.dataset.ready = '1';
} else {
  requestAnimationFrame(frame);
}
