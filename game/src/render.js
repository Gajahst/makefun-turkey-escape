// Draws a run: backdrop, props, dangers, the farmer, the turkey and the effects on top.

import { VIEW, GROUND_Y, TURKEY as T, STAGES, PALETTE as P } from './config.js';
import { drawScenery, drawExitDoor } from './scenery.js';
import { drawTurkey, drawFarmer, drawOven, drawKnife, drawCrate, drawHay, drawCorn, drawPie, drawFeather, drawShadow } from './sprites.js';
import { camXOf, DOOR_X } from './world.js';

const sy = (h) => GROUND_Y - h;

function turkeyPose(run) {
  const tk = run.turkey;
  if (run.outcome === 'escaped') return 'free';
  if (tk.hurtT > 0 || run.outcome === 'caught') return 'hurt';
  if (!tk.onGround) return 'jump';
  if (tk.ducking) return 'duck';
  return 'run';
}

function drawEntity(ctx, run, e, cam) {
  const x = e.wx - cam;
  if (x < -150 || x > VIEW.w + 150) return;
  switch (e.type) {
    case 'crate': drawShadow(ctx, x, GROUND_Y, e.w * 0.6); drawCrate(ctx, x, GROUND_Y, e.w, e.h); break;
    case 'hay': drawShadow(ctx, x, GROUND_Y, 52); drawHay(ctx, x, GROUND_Y, e.w, e.h, run.turkey.hidden === e, run.t);
      if (!e.used && !run.turkey.hidden && x > T.x && x < T.x + 260) hint(ctx, x, GROUND_Y - e.h - 16, 'S: hide');
      break;
    case 'oven': drawShadow(ctx, x, GROUND_Y, 40); drawOven(ctx, x, GROUND_Y, e.heat, e.firing, run.t); break;
    case 'knifeFly': drawShadow(ctx, x + 6, GROUND_Y, 22); drawKnife(ctx, x, sy(e.y), Math.PI, run.t); break;
    case 'knifeDrop':
      if (!e.stuck) {
        // A red target on the floor warns where it will land.
        const warn = e.falling ? 1 : 0.5 + 0.5 * Math.sin(run.t * 10);
        ctx.strokeStyle = `rgba(230,59,46,${warn})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(x, GROUND_Y + 4, 20, 6, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 8, GROUND_Y + 4); ctx.lineTo(x + 8, GROUND_Y + 4); ctx.stroke();
      }
      drawKnife(ctx, x, sy(e.y), Math.PI / 2, run.t);
      break;
    case 'corn': drawCorn(ctx, x, sy(e.y), run.t); break;
    case 'pie': drawPie(ctx, x, sy(e.y), run.t); break;
  }
}

function hint(ctx, x, y, text) {
  ctx.save();
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(255,244,224,0.9)';
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - 16, w, 22, 8); ctx.fill();
  ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.fillText(text, x, y);
  ctx.restore();
}

function drawFarmerOrArrow(ctx, run) {
  const fm = run.farmer;
  const tk = run.turkey;
  const caught = run.outcome === 'caught';
  // Once the end card is up, the caught scene is drawn by screens.js instead.
  if (caught && run.endT > 0.5) return;
  // On screen the farmer runs gap*0.6 behind the turkey; at a big gap only an arrow shows.
  const fx = caught ? T.x - 70 + Math.min(1, run.endT * 3) * 10 : T.x - 80 - fm.gap * 0.6;
  if (fx > -40) {
    drawShadow(ctx, fx, GROUND_Y, 30);
    const pose = caught ? 'grab' : tk.hidden ? 'search' : fm.state;
    drawFarmer(ctx, fx, GROUND_Y, pose, run.t);
  } else {
    const meters = Math.round(fm.gap / 40);
    ctx.save();
    ctx.fillStyle = P.hudBack;
    ctx.beginPath(); ctx.moveTo(12, 300); ctx.lineTo(34, 284); ctx.lineTo(34, 316); ctx.fill();
    ctx.beginPath(); ctx.roundRect(36, 286, 104, 28, 8); ctx.fill();
    ctx.fillStyle = P.cream; ctx.font = 'bold 14px "Trebuchet MS", sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`FARMER ${meters}m`, 44, 305);
    ctx.restore();
  }
}

export function drawRun(ctx, run) {
  const cam = camXOf(run);
  const stageId = STAGES[run.stage].id;
  ctx.save();
  if (run.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * run.shake, (Math.random() - 0.5) * 14 * run.shake);
  drawScenery(ctx, stageId, cam, run.t);

  const doorSx = DOOR_X - cam;
  if (doorSx < VIEW.w + 100) drawExitDoor(ctx, doorSx);

  for (const e of run.entities) if (e.type === 'hay' || e.type === 'crate') drawEntity(ctx, run, e, cam);
  for (const e of run.entities) if (e.type === 'oven') drawEntity(ctx, run, e, cam);

  // The turkey (hidden turkeys show only a peeking head and a twitching tail tip).
  const tk = run.turkey;
  if (tk.hidden) {
    const hx = tk.hidden.wx - cam;
    ctx.save();
    ctx.beginPath(); ctx.rect(hx - 60, GROUND_Y - 120, 120, 64); ctx.clip();
    drawTurkey(ctx, hx + 6, GROUND_Y - 22 + Math.sin(run.t * 3) * 3, 'duck', run.t);
    ctx.restore();
    drawHay(ctx, hx, GROUND_Y, tk.hidden.w, tk.hidden.h, true, run.t);
    const left = Math.max(0, 1 - tk.hideT / T.hideMax);
    ctx.fillStyle = P.hudBack; ctx.fillRect(hx - 40, GROUND_Y - 92, 80, 8);
    ctx.fillStyle = left > 0.3 ? P.good : P.danger; ctx.fillRect(hx - 40, GROUND_Y - 92, 80 * left, 8);
  } else if (!(run.outcome === 'escaped' && run.endT > 0.6) && !(run.outcome === 'caught' && run.endT > 0.5)) {
    const blink = tk.invuln > 0 && Math.floor(run.t * 16) % 2 === 0;
    drawShadow(ctx, T.x, GROUND_Y, 26 - Math.min(16, tk.y / 10));
    if (!blink) {
      ctx.save();
      if (tk.dashT > 0) {
        ctx.globalAlpha = 0.3;
        drawTurkey(ctx, T.x - 30, sy(tk.y), 'run', run.t);
        drawTurkey(ctx, T.x - 58, sy(tk.y), 'run', run.t);
        ctx.globalAlpha = 1;
      }
      drawTurkey(ctx, T.x + (run.outcome === 'escaped' ? run.endT * 300 : 0), sy(tk.y), turkeyPose(run), run.t);
      ctx.restore();
    }
  }

  for (const e of run.entities) if (e.type !== 'hay' && e.type !== 'crate' && e.type !== 'oven') drawEntity(ctx, run, e, cam);
  drawFarmerOrArrow(ctx, run);

  for (const p of run.particles) {
    const x = p.wx - cam, y = sy(p.y);
    ctx.globalAlpha = Math.min(1, p.life * 2);
    if (p.kind === 'feather') drawFeather(ctx, x, y, p.rot, p.color);
    else if (p.kind === 'straw') { ctx.strokeStyle = P.hay; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(p.rot) * 10, y + Math.sin(p.rot) * 10); ctx.stroke(); }
    else { ctx.fillStyle = p.kind === 'corn' ? P.corn : 'rgba(180,140,100,0.8)'; ctx.beginPath(); ctx.arc(x, y, p.kind === 'corn' ? 3 : 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  for (const q of run.pops) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, q.t * 2);
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = P.ink;
    ctx.strokeText(q.text, q.wx - cam, sy(q.y)); ctx.fillStyle = q.color; ctx.fillText(q.text, q.wx - cam, sy(q.y));
    ctx.restore();
  }
  ctx.restore();

  if (run.flash > 0) { ctx.fillStyle = `rgba(230,59,46,${run.flash})`; ctx.fillRect(0, 0, VIEW.w, VIEW.h); }
  // Danger vignette when the farmer is close
  if (!run.outcome && run.farmer.gap < 160) {
    const a = (1 - run.farmer.gap / 160) * (0.35 + 0.15 * Math.sin(run.t * 10));
    const g = ctx.createLinearGradient(0, 0, 220, 0);
    g.addColorStop(0, `rgba(200,30,20,${a})`); g.addColorStop(1, 'rgba(200,30,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 220, VIEW.h);
  }
}
