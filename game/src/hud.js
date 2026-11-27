// The heads-up display: lives, score, distance, the route map with the farmer on it, dash charge.

import { VIEW, TURKEY as T, STAGES, ESCAPE_METERS, PALETTE as P } from './config.js';
import { distanceOf, scoreOf } from './world.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = P.hudBack;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
}

function drumstick(ctx, x, y, full) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.6);
  ctx.globalAlpha = full ? 1 : 0.25;
  ctx.fillStyle = '#f4e3c8'; ctx.fillRect(-2, 4, 4, 12);
  ctx.beginPath(); ctx.arc(-3, 17, 3, 0, Math.PI * 2); ctx.arc(3, 17, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = full ? '#c4541f' : '#777';
  ctx.beginPath(); ctx.ellipse(0, -4, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawHud(ctx, run, muted) {
  const meters = distanceOf(run);
  // Lives
  panel(ctx, 14, 12, 150, 48);
  ctx.fillStyle = P.cream; ctx.font = `bold 12px ${FONT}`; ctx.textAlign = 'left';
  ctx.fillText('LIVES', 24, 30);
  for (let i = 0; i < T.lives; i++) drumstick(ctx, 86 + i * 26, 32, i < run.turkey.lives);
  // Score and distance
  panel(ctx, 176, 12, 260, 48);
  ctx.fillStyle = P.cream; ctx.font = `bold 12px ${FONT}`;
  ctx.fillText('SCORE', 188, 30); ctx.fillText('DISTANCE', 318, 30);
  ctx.font = `bold 22px ${FONT}`; ctx.fillStyle = '#f5cd30';
  ctx.fillText(String(scoreOf(run)).padStart(5, '0'), 188, 53);
  ctx.fillStyle = P.cream;
  ctx.fillText(`${meters} m`, 318, 53);

  // Route map: farmyard to barn to kitchen to the door, with the turkey and the farmer on it.
  const mx = 452, mw = 360, my = 36;
  panel(ctx, mx - 10, 12, mw + 20, 48);
  const colors = ['#8a9a3b', '#9c3b26', '#e9cfa9'];
  STAGES.forEach((s, i) => {
    const a = s.from / ESCAPE_METERS;
    const b = (STAGES[i + 1]?.from ?? ESCAPE_METERS) / ESCAPE_METERS;
    ctx.fillStyle = colors[i]; ctx.fillRect(mx + a * mw, my - 4, (b - a) * mw, 10);
    ctx.fillStyle = P.cream; ctx.font = `bold 10px ${FONT}`; ctx.textAlign = 'left';
    ctx.fillText(s.name.replace('The ', '').toUpperCase(), mx + a * mw + 3, my - 9);
  });
  ctx.fillStyle = P.cream; ctx.textAlign = 'right'; ctx.fillText('EXIT', mx + mw, my - 9);
  const tx = mx + (meters / ESCAPE_METERS) * mw;
  const fxm = Math.max(0, meters - run.farmer.gap / 40);
  const fx = mx + (fxm / ESCAPE_METERS) * mw;
  ctx.fillStyle = P.danger; ctx.beginPath(); ctx.arc(fx, my + 1, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9d6e3'; ctx.beginPath(); ctx.arc(tx, my + 1, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = P.cream; ctx.font = `10px ${FONT}`; ctx.textAlign = 'left';
  ctx.fillText('you', tx + 9, my + 18); ctx.fillStyle = '#ff9a8f'; ctx.textAlign = 'left'; ctx.fillText('farmer', Math.max(mx - 4, fx - 44), my + 18);

  // Dash charge
  panel(ctx, 828, 12, 118, 48);
  ctx.fillStyle = P.cream; ctx.font = `bold 12px ${FONT}`; ctx.textAlign = 'left';
  ctx.fillText('DASH  [Shift]', 838, 30);
  const charge = 1 - run.turkey.dashCd / T.dashCooldown;
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(838, 38, 98, 10);
  ctx.fillStyle = charge >= 1 ? P.good : '#e8a33d'; ctx.fillRect(838, 38, 98 * charge, 10);

  if (muted) { ctx.fillStyle = P.ink; ctx.font = `bold 12px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText('muted (M)', VIEW.w - 16, VIEW.h - 12); }

  // Stage banner
  if (run.banner.t > 0) {
    const a = Math.min(1, run.banner.t * 2, (2.4 - run.banner.t) * 4 + 0.2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = P.hudBack; ctx.beginPath(); ctx.roundRect(VIEW.w / 2 - 170, 96, 340, 62, 14); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#f5cd30'; ctx.font = `bold 13px ${FONT}`;
    ctx.fillText(`STAGE ${run.stage + 1} OF ${STAGES.length}`, VIEW.w / 2, 118);
    ctx.fillStyle = P.cream; ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(run.banner.text, VIEW.w / 2, 147);
    ctx.restore();
  }
}
