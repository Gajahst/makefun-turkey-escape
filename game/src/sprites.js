// Character and prop art, drawn as canvas vector shapes (no image files).
// Every draw function takes the context and a feet/base position in screen pixels.

import { PALETTE as P } from './config.js';

function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function outline(ctx, w = 3) { ctx.lineWidth = w; ctx.strokeStyle = P.ink; ctx.stroke(); }

export function drawShadow(ctx, x, y, w) {
  ellipse(ctx, x, y + 2, w, 7, 'rgba(58,36,20,0.25)');
}

// The turkey: a round brown body, a tail fan that flares, a blue-grey head and a red wattle.
// pose: 'run' | 'jump' | 'duck' | 'hurt' | 'hidden' | 'free'; t drives the run cycle.
export function drawTurkey(ctx, x, y, pose, t, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const duck = pose === 'duck';
  const bob = pose === 'run' ? Math.abs(Math.sin(t * 18)) * -4 : 0;
  const squash = duck ? 0.62 : 1;
  ctx.translate(0, bob);

  // Legs
  if (pose !== 'hidden') {
    const swing = pose === 'run' ? Math.sin(t * 18) * 9 : pose === 'jump' ? 6 : 0;
    ctx.strokeStyle = P.beak; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const s of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(-4 * s, -14 * squash);
      ctx.lineTo(-4 * s + swing * s, 0);
      ctx.lineTo(-4 * s + swing * s + 7, 0);
      ctx.stroke();
    }
  }

  // Tail fan
  const fanSpread = pose === 'hurt' ? 1.25 : pose === 'jump' ? 1.15 : 1;
  for (let ring = 0; ring < 4; ring++) {
    const r = (38 - ring * 7) * fanSpread * (duck ? 0.75 : 1);
    for (let i = -3; i <= 3; i++) {
      const a = -Math.PI / 2 - 0.55 + i * 0.22;
      ellipse(ctx, -16 + Math.cos(a) * r * 0.55, -34 * squash + Math.sin(a) * r * 0.55,
        8 - ring, r * 0.42, P.fan[ring], a + Math.PI / 2);
    }
  }

  // Body
  ctx.beginPath();
  ctx.ellipse(0, -28 * squash, 26, 22 * squash, 0, 0, Math.PI * 2);
  ctx.fillStyle = P.turkeyBody; ctx.fill(); outline(ctx);
  // Wing with feather scallops
  ctx.beginPath();
  ctx.ellipse(-4, -27 * squash, 15, 11 * squash, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = P.turkeyWing; ctx.fill();
  ctx.strokeStyle = 'rgba(244,213,141,0.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(-12 + i * 7, -22 * squash, 4, 0, Math.PI); ctx.stroke();
  }

  // Neck and head
  const hx = duck ? 24 : 18, hy = duck ? -26 : -56;
  ctx.strokeStyle = P.turkeyHead; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(14, -36 * squash); ctx.lineTo(hx, hy + 6); ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2);
  ctx.fillStyle = P.turkeyHead; ctx.fill(); outline(ctx, 2.5);
  // Beak
  ctx.beginPath(); ctx.moveTo(hx + 8, hy - 3); ctx.lineTo(hx + 18, hy + 1); ctx.lineTo(hx + 8, hy + 4); ctx.closePath();
  ctx.fillStyle = P.beak; ctx.fill(); outline(ctx, 2);
  // Wattle (snood)
  ctx.beginPath();
  ctx.moveTo(hx + 7, hy + 2);
  ctx.quadraticCurveTo(hx + 12, hy + 14 + Math.sin(t * 20) * 2, hx + 5, hy + 16);
  ctx.quadraticCurveTo(hx + 2, hy + 8, hx + 7, hy + 2);
  ctx.fillStyle = P.wattle; ctx.fill();
  // Eye: wide with fear when hurt, determined otherwise
  if (pose === 'hurt') {
    ellipse(ctx, hx + 3, hy - 3, 4.5, 4.5, '#fff');
    ellipse(ctx, hx + 4, hy - 3, 1.6, 1.6, P.ink);
  } else {
    ellipse(ctx, hx + 3, hy - 3, 3.5, 3.5, '#fff');
    ellipse(ctx, hx + 4.5, hy - 3, 2, 2, P.ink);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx - 2, hy - 9); ctx.lineTo(hx + 7, hy - 6); ctx.stroke();
  }
  if (pose === 'free') { // a tiny pilgrim-free party hat of leaves
    ellipse(ctx, hx - 2, hy - 11, 6, 3, '#d35400', -0.4);
    ellipse(ctx, hx + 4, hy - 12, 6, 3, '#e8a33d', 0.4);
  }
  ctx.restore();
}

// The farmer: straw hat, beard, plaid shirt, overall jeans and a big roasting sack.
// pose: 'run' | 'lunge' | 'search' | 'grab' | 'idle'
export function drawFarmer(ctx, x, y, pose, t, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const cycle = pose === 'run' || pose === 'lunge' ? t * 13 : pose === 'search' ? t * 4 : 0;
  const lean = pose === 'lunge' ? 0.28 : pose === 'run' ? 0.12 : 0;
  // Legs
  ctx.strokeStyle = P.farmerJeans; ctx.lineWidth = 13; ctx.lineCap = 'round';
  for (const s of [1, -1]) {
    const sw = Math.sin(cycle) * 16 * s;
    ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(sw, -6); ctx.stroke();
    ellipse(ctx, sw + 6, -4, 11, 6, P.ink);
  }
  ctx.rotate(lean);
  // Sack over the shoulder
  ctx.save();
  ctx.translate(-26, -100);
  ctx.rotate(-0.3 + Math.sin(cycle) * 0.08);
  ellipse(ctx, 0, 0, 20, 26, '#cdb288');
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 26, 0, 0, Math.PI * 2); outline(ctx, 2.5);
  ctx.fillStyle = '#8b6b3d'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('XL', 0, 6);
  ctx.restore();
  // Torso: plaid shirt
  ctx.beginPath(); ctx.roundRect(-22, -122, 44, 64, 12);
  ctx.fillStyle = P.farmerShirt; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = P.farmerPlaid; ctx.lineWidth = 4;
  for (let i = -22; i < 24; i += 11) { ctx.beginPath(); ctx.moveTo(i, -122); ctx.lineTo(i, -58); ctx.stroke(); }
  for (let j = -118; j < -58; j += 11) { ctx.beginPath(); ctx.moveTo(-22, j); ctx.lineTo(22, j); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(-22, -122, 44, 64, 12); outline(ctx);
  // Overall bib
  ctx.beginPath(); ctx.roundRect(-14, -96, 28, 36, 5); ctx.fillStyle = P.farmerJeans; ctx.fill(); outline(ctx, 2);
  // Arms: reaching forward when lunging or grabbing
  const reach = pose === 'lunge' || pose === 'grab' ? -1.2 : pose === 'search' ? -0.4 + Math.sin(t * 4) * 0.5 : Math.sin(cycle) * 0.9;
  ctx.strokeStyle = P.farmerShirt; ctx.lineWidth = 12;
  ctx.save(); ctx.translate(14, -112); ctx.rotate(reach);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 42); ctx.stroke();
  ellipse(ctx, 0, 46, 8, 8, P.farmerSkin);
  ctx.restore();
  // Head, beard, nose, eyes
  ellipse(ctx, 2, -140, 19, 20, P.farmerSkin);
  ctx.beginPath(); ctx.ellipse(2, -140, 19, 20, 0, 0, Math.PI * 2); outline(ctx, 2.5);
  ctx.beginPath(); ctx.moveTo(-16, -138); ctx.quadraticCurveTo(4, -100, 21, -138); ctx.quadraticCurveTo(4, -124, -16, -138);
  ctx.fillStyle = P.beard; ctx.fill();
  ellipse(ctx, 14, -140, 6, 5, '#e59866');
  const angry = pose === 'lunge' || pose === 'grab';
  ellipse(ctx, 8, -147, 2.5, angry ? 2 : 3, P.ink);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(2, angry ? -156 : -154); ctx.lineTo(14, angry ? -151 : -155); ctx.stroke();
  // Straw hat
  ellipse(ctx, 2, -156, 32, 7, P.farmerHat);
  ctx.beginPath(); ctx.roundRect(-14, -176, 32, 20, [10, 10, 2, 2]); ctx.fillStyle = P.farmerHat; ctx.fill(); outline(ctx, 2);
  ctx.fillStyle = P.farmerShirt; ctx.fillRect(-14, -162, 32, 5);
  ctx.restore();

  // Speech marks: "?" while searching, "!" while lunging
  if (pose === 'search' || pose === 'lunge') {
    ctx.save();
    ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6; ctx.strokeStyle = P.cream;
    const mark = pose === 'search' ? '?' : '!';
    const my = y - 200 * scale + Math.sin(t * 8) * 3;
    ctx.strokeText(mark, x + 6, my);
    ctx.fillStyle = pose === 'search' ? P.ink : P.danger;
    ctx.fillText(mark, x + 6, my);
    ctx.restore();
  }
}

// A cast-iron oven on legs. heat 0..1 glows the door; firing shoots a flame jet upward.
export function drawOven(ctx, x, y, heat, firing, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.ink;
  ctx.fillRect(-30, -10, 8, 10); ctx.fillRect(22, -10, 8, 10);
  ctx.beginPath(); ctx.roundRect(-36, -78, 72, 70, 8); ctx.fillStyle = P.ovenBody; ctx.fill(); outline(ctx);
  ctx.fillStyle = P.steelDark;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-20 + i * 20, -70, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.roundRect(-26, -60, 52, 42, 5); ctx.fillStyle = P.ovenDoor; ctx.fill();
  const glow = 0.25 + heat * 0.75;
  const g = ctx.createRadialGradient(0, -39, 2, 0, -39, 26);
  g.addColorStop(0, `rgba(255,200,80,${glow})`);
  g.addColorStop(1, `rgba(255,90,20,${glow * 0.5})`);
  ctx.beginPath(); ctx.roundRect(-20, -54, 40, 30, 4); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = P.steel; ctx.fillRect(-18, -64, 36, 4);
  // Chimney pipe
  ctx.fillStyle = P.ovenBody; ctx.fillRect(14, -98, 12, 22);
  if (firing) {
    for (let i = 0; i < 7; i++) {
      const fy = -100 - i * 16 - Math.sin(t * 30 + i) * 4;
      const r = 16 - i * 1.6 + Math.sin(t * 25 + i * 2) * 3;
      ellipse(ctx, 20 + Math.sin(t * 20 + i) * 4, fy, r * 0.8, r, i < 3 ? '#ffd23f' : '#ff7b1c');
    }
  } else if (heat > 0.6) {
    // Warning sparks before a burst
    for (let i = 0; i < 3; i++) ellipse(ctx, 20 + Math.sin(t * 9 + i * 2) * 6, -104 - ((t * 60 + i * 10) % 24), 3, 3, '#ffb347');
  }
  ctx.restore();
}

// A carving knife; angle in radians, shine flashes to make it readable.
export function drawKnife(ctx, x, y, angle, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath(); ctx.roundRect(-36, -6, 26, 12, 4); ctx.fillStyle = P.handle; ctx.fill(); outline(ctx, 2);
  ctx.fillStyle = P.steel;
  for (const rx of [-30, -20]) { ctx.beginPath(); ctx.arc(rx, 0, 2, 0, Math.PI * 2); ctx.fillStyle = P.hayDark; ctx.fill(); }
  ctx.beginPath();
  ctx.moveTo(-10, -7); ctx.lineTo(30, -7); ctx.quadraticCurveTo(44, -4, 48, 2); ctx.lineTo(-10, 7); ctx.closePath();
  ctx.fillStyle = P.steel; ctx.fill(); outline(ctx, 2);
  ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 12)})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(30, -3); ctx.stroke();
  ctx.restore();
}

export function drawCrate(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); ctx.fillStyle = P.crate; ctx.fill(); outline(ctx);
  ctx.strokeStyle = P.crateDark; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, y - h + 4); ctx.lineTo(x + w / 2 - 4, y - 4);
  ctx.moveTo(x + w / 2 - 4, y - h + 4); ctx.lineTo(x - w / 2 + 4, y - 4); ctx.stroke();
  ctx.fillStyle = P.cream; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('YAMS', x, y - h / 2 + 4);
  ctx.restore();
}

export function drawHay(ctx, x, y, w, h, rustle, t) {
  ctx.save();
  const shake = rustle ? Math.sin(t * 40) * 2 : 0;
  ctx.translate(x + shake, y);
  ctx.beginPath(); ctx.roundRect(-w / 2, -h, w, h, 12); ctx.fillStyle = P.hay; ctx.fill(); outline(ctx);
  ctx.strokeStyle = P.hayDark; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const sx = -w / 2 + 8 + i * (w - 16) / 8;
    ctx.beginPath(); ctx.moveTo(sx, -h + 6); ctx.lineTo(sx + 4, -6); ctx.stroke();
  }
  ctx.strokeStyle = '#a3542b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.35); ctx.lineTo(w / 2, -h * 0.35); ctx.stroke();
  // Stray straws on top
  ctx.strokeStyle = P.hay; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(-20 + i * 10, -h); ctx.lineTo(-24 + i * 11, -h - 8 - (i % 2) * 4); ctx.stroke();
  }
  ctx.restore();
}

export function drawPie(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4) * 4);
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
  glow.addColorStop(0, 'rgba(255,230,150,0.7)'); glow.addColorStop(1, 'rgba(255,230,150,0)');
  ctx.fillStyle = glow; ctx.fillRect(-34, -34, 68, 68);
  ctx.beginPath(); ctx.moveTo(-20, -2); ctx.lineTo(20, -2); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.closePath();
  ctx.fillStyle = '#c98b4b'; ctx.fill(); outline(ctx, 2);
  ellipse(ctx, 0, -3, 21, 7, '#e0a15a');
  ellipse(ctx, 0, -4, 16, 5, '#d9711e');
  ellipse(ctx, 0, -7, 6, 3, '#fff8ec');
  ctx.restore();
}

export function drawCorn(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 5 + x) * 3);
  ctx.rotate(0.35);
  ellipse(ctx, 0, 0, 7, 14, P.corn);
  ctx.fillStyle = '#e0a800';
  for (let r = -9; r <= 9; r += 4.5) for (const c of [-3, 3]) { ctx.beginPath(); ctx.arc(c, r, 1.5, 0, Math.PI * 2); ctx.fill(); }
  ellipse(ctx, -6, 6, 4, 12, P.husk, -0.4);
  ellipse(ctx, 6, 6, 4, 12, P.husk, 0.4);
  ctx.restore();
}

export function drawFeather(ctx, x, y, rot, color) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ellipse(ctx, 0, 0, 3.5, 9, color);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 11); ctx.stroke();
  ctx.restore();
}
