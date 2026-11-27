// Parallax backdrops for the three stages: the farmyard at dusk, the big red barn and the kitchen.
// camX is the camera's world x; each layer scrolls at its own fraction of it.

import { VIEW, GROUND_Y, PALETTE as P } from './config.js';

const wrap = (v, span) => ((v % span) + span) % span;

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.w, GROUND_Y);
}

function hills(ctx, camX, factor, color, baseY, amp, span) {
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.w; x += 16) {
    const wx = x + camX * factor;
    ctx.lineTo(x, baseY - Math.sin(wx / span) * amp - Math.sin(wx / (span * 0.37)) * amp * 0.35);
  }
  ctx.lineTo(VIEW.w, GROUND_Y); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

function drawFarm(ctx, camX, t) {
  sky(ctx, P.skyTop, P.skyBottom);
  // Low autumn sun
  const sg = ctx.createRadialGradient(760, 150, 10, 760, 150, 90);
  sg.addColorStop(0, 'rgba(255,240,200,1)'); sg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = sg; ctx.fillRect(640, 40, 260, 240);
  // Drifting clouds
  ctx.fillStyle = 'rgba(255,248,235,0.75)';
  for (let i = 0; i < 4; i++) {
    const cx = wrap(i * 300 - camX * 0.05 - t * 8, VIEW.w + 200) - 100;
    const cy = 70 + (i % 2) * 40;
    for (const [dx, dy, r] of [[0, 0, 22], [24, -8, 26], [50, 0, 20]]) {
      ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  hills(ctx, camX, 0.15, P.hillFar, 330, 30, 160);
  // Distant barn silhouette and trees on the far hill
  const bx = wrap(600 - camX * 0.15, VIEW.w + 400) - 200;
  ctx.fillStyle = '#9c4a2a';
  ctx.beginPath(); ctx.moveTo(bx, 320); ctx.lineTo(bx, 285); ctx.lineTo(bx + 30, 265); ctx.lineTo(bx + 60, 285); ctx.lineTo(bx + 60, 320); ctx.fill();
  hills(ctx, camX, 0.35, P.hillNear, 385, 22, 120);
  for (let i = 0; i < 6; i++) {
    const tx = wrap(i * 190 - camX * 0.35, VIEW.w + 200) - 100;
    ctx.fillStyle = '#5b3a1e'; ctx.fillRect(tx - 3, 350, 6, 30);
    ctx.fillStyle = ['#c0392b', '#e67e22', '#d4a017'][i % 3];
    ctx.beginPath(); ctx.arc(tx, 342, 20, 0, Math.PI * 2); ctx.fill();
  }
  // Fence just behind the path
  ctx.fillStyle = '#f0dcc0'; ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
  const off = wrap(-camX * 0.8, 70);
  ctx.fillRect(0, 404, VIEW.w, 6); ctx.fillRect(0, 420, VIEW.w, 6);
  for (let x = off - 70; x < VIEW.w + 70; x += 70) { ctx.fillRect(x, 396, 9, 44); ctx.strokeRect(x, 396, 9, 44); }
  // Pumpkins by the fence
  for (let i = 0; i < 4; i++) {
    const px = wrap(i * 260 + 90 - camX * 0.8, VIEW.w + 120) - 60;
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.ellipse(px, 430, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b35400'; ctx.beginPath(); ctx.moveTo(px, 420); ctx.lineTo(px, 440); ctx.stroke();
    ctx.fillStyle = '#4e6b1f'; ctx.fillRect(px - 2, 415, 4, 6);
  }
  ground(ctx, camX, P.grass, P.grassDark, P.dirt);
}

function drawBarn(ctx, camX, t) {
  // Plank wall
  ctx.fillStyle = '#9c3b26'; ctx.fillRect(0, 0, VIEW.w, GROUND_Y);
  const off = wrap(-camX * 0.5, 48);
  ctx.strokeStyle = '#7a2b1a'; ctx.lineWidth = 3;
  for (let x = off - 48; x < VIEW.w + 48; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_Y); ctx.stroke(); }
  // Hay loft beam and hanging lanterns
  ctx.fillStyle = '#5e2c17'; ctx.fillRect(0, 120, VIEW.w, 18);
  const loft = wrap(-camX * 0.5, 400);
  for (let x = loft - 400; x < VIEW.w + 400; x += 400) {
    ctx.fillStyle = P.hay; ctx.beginPath(); ctx.roundRect(x + 40, 72, 120, 48, 10); ctx.fill();
    ctx.fillStyle = P.hayDark; ctx.fillRect(x + 40, 96, 120, 4);
    // Window with a sunset view
    ctx.fillStyle = '#f4b183'; ctx.fillRect(x + 230, 190, 90, 90);
    ctx.fillStyle = '#d98c4a'; ctx.fillRect(x + 230, 250, 90, 30);
    ctx.strokeStyle = '#f0dcc0'; ctx.lineWidth = 6; ctx.strokeRect(x + 230, 190, 90, 90);
    ctx.beginPath(); ctx.moveTo(x + 275, 190); ctx.lineTo(x + 275, 280); ctx.moveTo(x + 230, 235); ctx.lineTo(x + 320, 235); ctx.stroke();
    // Lantern swinging on a rope
    const sway = Math.sin(t * 2 + x) * 0.15;
    ctx.save(); ctx.translate(x + 200, 138); ctx.rotate(sway);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
    const lg = ctx.createRadialGradient(0, 52, 2, 0, 52, 50);
    lg.addColorStop(0, 'rgba(255,220,120,0.8)'); lg.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = lg; ctx.fillRect(-50, 2, 100, 100);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(-8, 42, 16, 20);
    ctx.restore();
  }
  // Tools on the wall: pitchfork and horseshoe
  const tools = wrap(150 - camX * 0.5, 560);
  ctx.strokeStyle = '#d8c3a0'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(tools, 330); ctx.lineTo(tools, 230); ctx.stroke();
  ctx.strokeStyle = P.steelDark; ctx.lineWidth = 3;
  for (const dx of [-10, 0, 10]) { ctx.beginPath(); ctx.moveTo(tools + dx, 230); ctx.lineTo(tools + dx, 205); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(tools - 10, 230); ctx.lineTo(tools + 10, 230); ctx.stroke();
  ground(ctx, camX, P.floorBoards, P.floorDark, '#5e3a1e');
  // Scattered straw on the boards
  ctx.strokeStyle = P.hay; ctx.lineWidth = 2;
  const st = wrap(-camX, 90);
  for (let x = st - 90; x < VIEW.w + 90; x += 90) {
    ctx.beginPath(); ctx.moveTo(x, 452); ctx.lineTo(x + 14, 448); ctx.moveTo(x + 30, 470); ctx.lineTo(x + 40, 476); ctx.stroke();
  }
}

function drawKitchen(ctx, camX, t) {
  ctx.fillStyle = P.kitchenWall; ctx.fillRect(0, 0, VIEW.w, GROUND_Y);
  // Tiled backsplash
  const off = wrap(-camX * 0.6, 40);
  ctx.fillStyle = P.kitchenTile; ctx.fillRect(0, 250, VIEW.w, 110);
  ctx.strokeStyle = '#d7b68a'; ctx.lineWidth = 2;
  for (let x = off - 40; x < VIEW.w + 40; x += 40) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 360); ctx.stroke(); }
  for (let y = 250; y <= 360; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW.w, y); ctx.stroke(); }
  // Upper cabinets, window and hanging pans
  const span = 520;
  const base = wrap(-camX * 0.6, span);
  for (let x = base - span; x < VIEW.w + span; x += span) {
    ctx.fillStyle = P.kitchenTrim; ctx.fillRect(x, 40, 200, 110);
    ctx.fillStyle = '#b8683d'; ctx.fillRect(x + 10, 50, 85, 90); ctx.fillRect(x + 105, 50, 85, 90);
    ctx.fillStyle = P.beak; ctx.fillRect(x + 85, 90, 6, 14); ctx.fillRect(x + 109, 90, 6, 14);
    // Window to the outside: freedom, so close
    ctx.fillStyle = '#f7b267'; ctx.fillRect(x + 250, 60, 140, 120);
    ctx.fillStyle = '#b8662f'; ctx.beginPath(); ctx.moveTo(x + 250, 180); ctx.quadraticCurveTo(x + 320, 120, x + 390, 180); ctx.fill();
    ctx.strokeStyle = '#fff4e0'; ctx.lineWidth = 7; ctx.strokeRect(x + 250, 60, 140, 120);
    ctx.beginPath(); ctx.moveTo(x + 320, 60); ctx.lineTo(x + 320, 180); ctx.stroke();
    // Curtains
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(x + 240, 54); ctx.quadraticCurveTo(x + 262, 120, x + 244, 190); ctx.lineTo(x + 240, 190); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 400, 54); ctx.quadraticCurveTo(x + 378, 120, x + 396, 190); ctx.lineTo(x + 400, 190); ctx.fill();
    // Pans on a rail
    ctx.fillStyle = P.ink; ctx.fillRect(x + 420, 40, 90, 4);
    for (let i = 0; i < 3; i++) {
      const sw = Math.sin(t * 3 + i + x) * 0.08;
      ctx.save(); ctx.translate(x + 435 + i * 30, 44); ctx.rotate(sw);
      ctx.fillStyle = P.steelDark; ctx.fillRect(-2, 0, 4, 30);
      ctx.fillStyle = i === 1 ? '#b87333' : P.ink;
      ctx.beginPath(); ctx.arc(0, 44, 14 - i * 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  // Counter running along the back
  const ctrOff = wrap(-camX * 0.8, 160);
  ctx.fillStyle = '#efe6d8'; ctx.fillRect(0, 360, VIEW.w, 12);
  ctx.fillStyle = '#9b4f2c'; ctx.fillRect(0, 372, VIEW.w, 68);
  ctx.strokeStyle = '#7e3d20'; ctx.lineWidth = 3;
  for (let x = ctrOff - 160; x < VIEW.w + 160; x += 160) { ctx.strokeRect(x + 8, 380, 144, 52); ctx.fillStyle = P.beak; ctx.fillRect(x + 74, 400, 12, 4); }
  // Recipe card pinned up, a little joke for the attentive
  const card = wrap(630 - camX * 0.6, 1040) - 60;
  // Pinned high on the wall, above the turkey's jump arc, so the joke stays readable.
  const cy = 196;
  ctx.fillStyle = '#fffaf0'; ctx.fillRect(card, cy, 90, 64);
  ctx.fillStyle = P.danger; ctx.beginPath(); ctx.arc(card + 45, cy + 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.ink; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('ROAST TURKEY', card + 6, cy + 22);
  ctx.font = '10px sans-serif';
  ctx.fillText('1. catch turkey', card + 6, cy + 38);
  ctx.fillText('2. ...', card + 6, cy + 52);
  // Checkered floor
  ctx.fillStyle = '#efe6d8'; ctx.fillRect(0, GROUND_Y, VIEW.w, VIEW.h - GROUND_Y);
  ctx.fillStyle = '#b44a3a';
  const sq = 40, foff = wrap(-camX, sq * 2);
  for (let row = 0; row < 3; row++) {
    for (let x = foff - sq * 2 + (row % 2) * sq; x < VIEW.w + sq; x += sq * 2) ctx.fillRect(x, GROUND_Y + row * sq, sq, sq);
  }
  ctx.fillStyle = P.ink; ctx.fillRect(0, GROUND_Y, VIEW.w, 3);
}

function ground(ctx, camX, top, dark, under) {
  ctx.fillStyle = top; ctx.fillRect(0, GROUND_Y, VIEW.w, 14);
  ctx.fillStyle = under; ctx.fillRect(0, GROUND_Y + 14, VIEW.w, VIEW.h - GROUND_Y - 14);
  ctx.fillStyle = dark;
  const off = wrap(-camX, 36);
  for (let x = off - 36; x < VIEW.w + 36; x += 36) {
    ctx.fillRect(x, GROUND_Y + 14, 18, 4);
    ctx.fillRect(x + 12, GROUND_Y + 40, 10, 3);
    ctx.fillRect(x + 26, GROUND_Y + 66, 14, 3);
  }
  ctx.fillStyle = P.ink; ctx.fillRect(0, GROUND_Y, VIEW.w, 3);
}

export function drawScenery(ctx, stageId, camX, t) {
  if (stageId === 'barn') drawBarn(ctx, camX, t);
  else if (stageId === 'kitchen') drawKitchen(ctx, camX, t);
  else drawFarm(ctx, camX, t);
}

// The exit: an open back door with the woods beyond, placed in the world at the escape line.
export function drawExitDoor(ctx, sx) {
  ctx.save();
  ctx.fillStyle = '#5e2c17'; ctx.fillRect(sx - 70, GROUND_Y - 230, 140, 230);
  const g = ctx.createLinearGradient(0, GROUND_Y - 220, 0, GROUND_Y);
  g.addColorStop(0, '#f7b267'); g.addColorStop(0.7, '#e8a33d'); g.addColorStop(1, '#6c7a2a');
  ctx.fillStyle = g; ctx.fillRect(sx - 58, GROUND_Y - 218, 116, 218);
  ctx.fillStyle = '#2f4b1f';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(sx - 50 + i * 30, GROUND_Y - 40); ctx.lineTo(sx - 36 + i * 30, GROUND_Y - 110); ctx.lineTo(sx - 22 + i * 30, GROUND_Y - 40); ctx.fill(); }
  ctx.fillStyle = '#fff4e0'; ctx.font = 'bold 16px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', sx, GROUND_Y - 240);
  ctx.restore();
}
