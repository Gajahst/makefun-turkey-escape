// Menus: the title screen, the pause card and the caught / escaped end screens with restart.
// Each screen returns the buttons it drew so main.js can hit-test mouse clicks against them.

import { VIEW, GROUND_Y, PALETTE as P, ESCAPE_METERS } from './config.js';
import { drawScenery } from './scenery.js';
import { drawTurkey, drawFarmer, drawOven, drawKnife, drawShadow, drawCorn } from './sprites.js';
import { distanceOf, scoreOf } from './world.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

export function button(ctx, x, y, w, h, label, mouse, primary) {
  const hot = mouse.x > x && mouse.x < x + w && mouse.y > y && mouse.y < y + h;
  ctx.save();
  ctx.fillStyle = 'rgba(58,36,20,0.35)';
  ctx.beginPath(); ctx.roundRect(x + 3, y + 5, w, h, 14); ctx.fill();
  ctx.fillStyle = primary ? (hot ? '#f07a2a' : '#d9531e') : (hot ? '#fff' : P.cream);
  ctx.beginPath(); ctx.roundRect(x, y + (hot ? 2 : 0), w, h, 14); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.fillStyle = primary ? P.cream : P.ink;
  ctx.font = `bold ${Math.round(h * 0.42)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + (hot ? 3 : 1));
  ctx.restore();
  return { x, y, w, h, hot };
}

function title(ctx, text, y, size, fill) {
  ctx.save();
  ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.22; ctx.strokeStyle = P.ink; ctx.strokeText(text, VIEW.w / 2, y);
  ctx.fillStyle = fill; ctx.fillText(text, VIEW.w / 2, y);
  ctx.restore();
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(255,244,224,0.93)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
}

export function drawTitle(ctx, t, mouse, best) {
  drawScenery(ctx, 'farm', t * 120, t);
  // The chase loops across the bottom of the title screen.
  const loop = (t * 140) % (VIEW.w + 500) - 250;
  drawShadow(ctx, loop + 200, GROUND_Y, 26);
  drawTurkey(ctx, loop + 200, GROUND_Y - Math.abs(Math.sin(t * 3)) * 30, Math.sin(t * 3) > 0.6 ? 'jump' : 'run', t);
  drawShadow(ctx, loop, GROUND_Y, 30);
  drawFarmer(ctx, loop, GROUND_Y, 'lunge', t);
  drawOven(ctx, 880, GROUND_Y, 0.8 + 0.2 * Math.sin(t * 4), Math.sin(t * 2) > 0.4, t);
  drawKnife(ctx, 840 + Math.sin(t * 2) * 10, 200, Math.PI + Math.sin(t * 3) * 0.2, t);
  drawCorn(ctx, 640, 400, t);

  title(ctx, 'GOBBLE', 112, 84, '#f5cd30');
  title(ctx, 'GETAWAY', 190, 84, '#e8742a');
  ctx.save();
  ctx.font = `bold 20px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = P.ink;
  ctx.fillText('Thanksgiving is coming. The farmer has a sack. You have legs.', VIEW.w / 2, 228);
  ctx.restore();

  const play = button(ctx, VIEW.w / 2 - 120, 246, 240, 60, 'RUN FOR IT!', mouse, true);
  card(ctx, VIEW.w / 2 - 320, 318, 640, 52);
  ctx.save();
  ctx.font = `bold 14px ${FONT}`; ctx.textAlign = 'left';
  const pairs = [
    ['Space / click', 'jump (hold = higher)'], ['S / right-click', 'duck or hide in hay'],
    ['A / D', 'slow down / speed up'], ['Shift', 'dash   P pause   M mute'],
  ];
  pairs.forEach(([k, v], i) => {
    const x = VIEW.w / 2 - 302 + (i % 2) * 310, y = 339 + Math.floor(i / 2) * 20;
    ctx.fillStyle = '#9b4f2c'; ctx.fillText(k, x, y);
    ctx.fillStyle = P.ink; ctx.fillText(v, x + 118, y);
  });
  ctx.restore();
  ctx.save();
  ctx.font = `bold 16px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = P.cream;
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink;
  const goal = `Run ${ESCAPE_METERS} m: farmyard, barn, kitchen, out the back door.     Best score: ${best}`;
  ctx.strokeText(goal, VIEW.w / 2, 494); ctx.fillText(goal, VIEW.w / 2, 494);
  ctx.restore();
  return [{ ...play, action: 'start' }];
}

export function drawPause(ctx, mouse) {
  ctx.fillStyle = 'rgba(30,18,10,0.55)'; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  title(ctx, 'PAUSED', 220, 64, P.cream);
  const resume = button(ctx, VIEW.w / 2 - 110, 260, 220, 54, 'Keep running', mouse, true);
  const quit = button(ctx, VIEW.w / 2 - 110, 328, 220, 48, 'Title screen', mouse, false);
  return [{ ...resume, action: 'resume' }, { ...quit, action: 'title' }];
}

export function drawEnd(ctx, run, mouse, best, newBest) {
  const escaped = run.outcome === 'escaped';
  const a = Math.min(1, run.endT * 1.5);
  ctx.fillStyle = escaped ? `rgba(255,214,140,${0.55 * a})` : `rgba(40,16,10,${0.6 * a})`;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  if (run.endT < 0.5) return [];

  if (escaped) {
    title(ctx, 'ESCAPED!', 116, 80, '#f5cd30');
    ctx.save(); ctx.font = `bold 21px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = P.ink;
    ctx.fillText('Free bird! This year the family is having tofu.', VIEW.w / 2, 154); ctx.restore();
    drawTurkey(ctx, 200, 330 - Math.abs(Math.sin(run.t * 6)) * 24, 'free', run.t, 1.6);
  } else {
    title(ctx, 'CAUGHT!', 116, 80, '#e63b2e');
    ctx.save(); ctx.font = `bold 21px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = P.cream;
    ctx.fillText('Into the sack. Preheat to 350.', VIEW.w / 2, 154); ctx.restore();
    drawFarmer(ctx, 150, 400, 'grab', run.t, 1.3);
    // The turkey dangles from the farmer's fist, tail fan flapping in protest.
    drawTurkey(ctx, 218, 290 + Math.sin(run.t * 8) * 4, 'hurt', run.t, 1.0);
  }

  card(ctx, VIEW.w / 2 - 170, 186, 340, 178);
  const rows = [
    ['Distance', `${distanceOf(run)} / ${ESCAPE_METERS} m`],
    ['Corn grabbed', `${run.corn}`],
    ['Close shaves', `${run.nearMisses}`],
    ['Sneaky hides', `${run.sneaks}`],
    ['Score', `${scoreOf(run)}`],
  ];
  ctx.save();
  rows.forEach(([k, v], i) => {
    const y = 218 + i * 28;
    ctx.font = `bold 18px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#9b4f2c'; ctx.fillText(k, VIEW.w / 2 - 146, y);
    ctx.textAlign = 'right'; ctx.fillStyle = P.ink; ctx.font = `bold ${i === 4 ? 22 : 18}px ${FONT}`; ctx.fillText(v, VIEW.w / 2 + 146, y);
  });
  ctx.font = `bold 14px ${FONT}`; ctx.textAlign = 'center';
  ctx.fillStyle = newBest ? '#d9531e' : '#7e4a27';
  ctx.fillText(newBest ? 'NEW BEST SCORE!' : `Best: ${best}`, VIEW.w / 2, 354);
  ctx.restore();

  const again = button(ctx, VIEW.w / 2 - 170, 382, 200, 58, 'RUN AGAIN', mouse, true);
  const menu = button(ctx, VIEW.w / 2 + 44, 382, 126, 58, 'Title', mouse, false);
  ctx.save(); ctx.font = `bold 13px ${FONT}`; ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? P.ink : P.cream;
  ctx.fillText('R or Space to run again', VIEW.w / 2, 462); ctx.restore();
  return [{ ...again, action: 'restart' }, { ...menu, action: 'title' }];
}
