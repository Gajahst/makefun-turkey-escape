// The run itself: the turkey, the farmer on its tail, the dangers and the pickups.
// World x grows to the right; heights are measured up from the ground (0 = standing on it).
// step() advances one fixed tick and pushes sound names into run.events for main.js to play.

import { TURKEY as T, FARMER as F, STAGES, SCORE, PX_PER_METER, ESCAPE_METERS, VIEW } from './config.js';
import { makeRandom } from './random.js';

export const DOOR_X = ESCAPE_METERS * PX_PER_METER + 80;

export function createRun(seed) {
  return {
    rng: makeRandom(seed),
    t: 0,
    turkey: {
      wx: 0, y: 0, vy: 0, speed: T.baseSpeed, onGround: true, ducking: false,
      hidden: null, hideT: 0, dashT: 0, dashCd: 0, invuln: 0, hurtT: 0, lives: T.lives, jumpHeld: false,
    },
    farmer: { gap: F.startGap, state: 'chase', alert: 0, lungeCalled: false },
    entities: [],
    particles: [],
    pops: [],
    corn: 0, nearMisses: 0, sneaks: 0, bonus: 0, hits: 0, pies: 0, dashes: 0,
    stage: 0, banner: { text: STAGES[0].name, sub: STAGES[0].warn, t: 2.2 },
    nextSpawnX: 700,
    shake: 0, flash: 0,
    outcome: null, endT: 0,
    events: [],
  };
}

export const distanceOf = (run) => Math.min(ESCAPE_METERS, Math.floor(run.turkey.wx / PX_PER_METER));
export const scoreOf = (run) => distanceOf(run) * SCORE.perMeter + run.corn * SCORE.corn + run.nearMisses * SCORE.nearMiss + run.bonus;
export const camXOf = (run) => run.turkey.wx - T.x;

function turkeyBox(tk) {
  const h = tk.ducking ? T.duckH : T.h;
  return { l: tk.wx - T.w / 2 + 6, r: tk.wx + T.w / 2 - 4, b: tk.y, t: tk.y + h };
}

const overlaps = (a, b, pad = 0) => a.l - pad < b.r && a.r + pad > b.l && a.b - pad < b.t && a.t + pad > b.b;

// Each entity reports the boxes that hurt (or that it offers) right now.
function hazardBoxes(e) {
  switch (e.type) {
    case 'crate': return [{ l: e.wx - e.w / 2, r: e.wx + e.w / 2, b: 0, t: e.h }];
    case 'oven': {
      const boxes = [{ l: e.wx - 34, r: e.wx + 34, b: 0, t: 76 }];
      if (e.firing) boxes.push({ l: e.wx + 8, r: e.wx + 32, b: 96, t: 180 });
      return boxes;
    }
    case 'knifeFly': return [{ l: e.wx - 34, r: e.wx + 46, b: e.y - 6, t: e.y + 6 }];
    case 'knifeDrop': return e.stuck ? [] : [{ l: e.wx - 7, r: e.wx + 7, b: e.y - 30, t: e.y + 40 }];
    default: return [];
  }
}

function spawn(run, wx) {
  const st = STAGES[run.stage];
  const rng = run.rng;
  const kind = rng.pick(st.mix);
  const lvl = run.stage;
  if (kind === 'crate') run.entities.push({ type: 'crate', wx, w: 46, h: rng.next() < 0.3 + lvl * 0.2 ? 64 : 46 });
  else if (kind === 'hay') run.entities.push({ type: 'hay', wx, w: 96, h: 58, used: false });
  else if (kind === 'oven') run.entities.push({ type: 'oven', wx, phase: rng.range(0, 2.2), period: 2.4 - lvl * 0.25, heat: 0, firing: false });
  else if (kind === 'knifeFly') {
    // Launch it from far enough ahead that it meets the turkey at its own slot, so a thrown
    // knife never lands on top of the next danger and every combo stays dodgeable.
    const low = rng.next() < 0.35;
    const vx = -(220 + lvl * 60 + rng.range(0, 60));
    const meet = (wx - run.turkey.wx) / T.baseSpeed;
    run.entities.push({ type: 'knifeFly', wx: wx - vx * meet, y: low ? 16 : 46, vx, whooshed: false });
  } else if (kind === 'knifeDrop') {
    run.entities.push({ type: 'knifeDrop', wx, y: 520, vy: 0, falling: false, stuck: false, trigger: 330 + lvl * 30 });
  } else if (kind === 'pie') {
    // A pumpkin pie floats just above jump height: one life back, or points when healthy.
    run.entities.push({ type: 'pie', wx, y: 110, taken: false });
  } else {
    const high = rng.next() < 0.5;
    for (let i = 0; i < 3; i++) {
      const arc = high ? Math.sin((i / 2) * Math.PI) * 50 + 90 : 24;
      run.entities.push({ type: 'corn', wx: wx + i * 44, y: arc, taken: false });
    }
  }
  const [a, b] = st.spawnGap;
  return wx + rng.range(a, b) * T.baseSpeed;
}

// When the farmer is close and a crate, oven or hay bale blocks the way just ahead, he closes in
// faster: the turkey is cornered and must jump, dash or hide now. Returns his extra speed.
function farmerCornersTurkey(run) {
  const tk = run.turkey, fm = run.farmer;
  if (fm.gap > 200) { fm.cornered = false; return 0; }
  const blocked = run.entities.some((e) => (e.type === 'crate' || e.type === 'oven' || (e.type === 'hay' && !e.used))
    && e.wx > tk.wx && e.wx - tk.wx < 150);
  if (blocked && !fm.cornered) pop(run, 'CORNERED!', '#e63b2e', tk.wx, tk.y + 110);
  fm.cornered = blocked;
  return blocked ? 60 : 0;
}

function pop(run, text, color, wx, y) { run.pops.push({ text, color, wx, y, t: 1.1 }); }

function burst(run, wx, y, n, kind) {
  for (let i = 0; i < n; i++) {
    run.particles.push({
      kind, wx, y,
      vx: run.rng.range(-180, 180), vy: run.rng.range(80, 360),
      rot: run.rng.range(0, 6), vr: run.rng.range(-8, 8),
      color: ['#8c2f1b', '#c4541f', '#e8a33d', '#6b3f22', '#f5cd30'][run.rng.int(0, kind === 'corn' ? 4 : 3)],
      life: run.rng.range(0.6, 1.2),
    });
  }
}

function hurt(run) {
  const tk = run.turkey;
  tk.lives -= 1;
  run.hits++;
  tk.invuln = T.invulnTime;
  tk.hurtT = 0.4;
  tk.speed = T.minSpeed;
  run.farmer.gap -= F.hitLunge;
  run.farmer.alert = Math.min(1, run.farmer.alert + 0.35);
  run.shake = 0.35; run.flash = 0.25;
  burst(run, tk.wx, tk.y + 30, 12, 'feather');
  pop(run, 'OUCH!', '#e63b2e', tk.wx, tk.y + 90);
  run.events.push('hit', 'gobble');
}

function finish(run, outcome) {
  if (run.outcome) return;
  run.outcome = outcome;
  run.endT = 0;
  if (outcome === 'escaped') {
    run.bonus += SCORE.escapeBonus + run.turkey.lives * SCORE.lifeBonus;
    run.events.push('escaped');
  } else {
    run.farmer.state = 'grab';
    run.events.push('caught');
  }
}

// controls: { jump, jumpPressed, duck, slow, fast, dashPressed }
export function step(run, dt, c) {
  run.t += dt;
  run.shake = Math.max(0, run.shake - dt);
  run.flash = Math.max(0, run.flash - dt);
  if (run.banner.t > 0) run.banner.t -= dt;
  updateEffects(run, dt);
  if (run.outcome) { run.endT += dt; return; }

  const tk = run.turkey;
  const fm = run.farmer;
  tk.invuln = Math.max(0, tk.invuln - dt);
  tk.hurtT = Math.max(0, tk.hurtT - dt);
  tk.dashCd = Math.max(0, tk.dashCd - dt);

  // Hiding in a hay bale: the world holds still and the farmer pokes through the hay.
  // Slip out before his search meter fills and he loses you; stay too long and he finds you.
  if (tk.hidden) {
    tk.hideT += dt;
    fm.state = 'search';
    fm.alert = Math.max(0, fm.alert - dt * 0.5);
    if (tk.hideT >= T.hideMax) {
      tk.hidden.used = true;
      tk.hidden = null;
      fm.state = 'chase';
      pop(run, 'FOUND YOU!', '#e63b2e', tk.wx, 150);
      run.events.push('spotted');
      hurt(run);
      fm.gap = 150; // he grabs, the turkey wriggles free with the farmer right behind
      tk.speed = T.baseSpeed;
      if (tk.lives <= 0) finish(run, 'caught');
      return;
    }
    if (!c.duck) {
      tk.hidden.used = true;
      tk.hidden = null;
      fm.gap = Math.min(F.maxGap, fm.gap + 90);
      run.bonus += 100; run.sneaks++;
      pop(run, 'SNEAKY! +100', '#5fae4b', tk.wx, 120);
      tk.speed = T.baseSpeed + 60;
      fm.state = 'chase';
      run.events.push('gobble');
    }
    return;
  }

  // Speed: steer between a careful walk and an all-out sprint; a dash is a short burst.
  if (c.dashPressed && tk.dashCd === 0) {
    tk.dashT = T.dashTime; tk.dashCd = T.dashCooldown; run.dashes++;
    burst(run, tk.wx - 20, tk.y + 20, 6, 'dust');
    run.events.push('dash');
  }
  const target = c.fast ? T.maxSpeed : c.slow ? T.minSpeed : T.baseSpeed;
  tk.speed += Math.sign(target - tk.speed) * Math.min(Math.abs(target - tk.speed), T.accel * dt);
  const speed = tk.dashT > 0 ? T.dashSpeed : tk.speed;
  tk.dashT = Math.max(0, tk.dashT - dt);
  tk.wx += speed * dt;

  // Jump (hold for higher), duck, gravity.
  if (c.jumpPressed && tk.onGround) {
    tk.vy = T.jumpV; tk.onGround = false; tk.jumpHeld = true;
    run.events.push('jump');
  }
  if (!c.jump) tk.jumpHeld = false;
  if (!tk.onGround) {
    tk.vy -= T.gravity * dt;
    if (tk.jumpHeld && tk.vy > 0) tk.vy += T.jumpHoldBoost * dt * 0.5;
    tk.y += tk.vy * dt;
    if (tk.y <= 0) { tk.y = 0; tk.vy = 0; tk.onGround = true; burst(run, tk.wx, 0, 3, 'dust'); }
  }
  tk.ducking = c.duck && tk.onGround;
  if (c.duck && !tk.onGround) tk.vy -= T.gravity * dt; // fast-fall

  // The farmer: faster each stage and when angry; lunges when close, and corners a turkey
  // that has to slow for a danger right in front of it.
  const farmerSpeed = F.baseSpeed + run.stage * F.catchUpPerStage + fm.alert * 70 + farmerCornersTurkey(run);
  fm.gap = Math.min(F.maxGap, fm.gap + (speed - farmerSpeed) * dt);
  fm.alert = Math.max(0, fm.alert - dt * 0.04);
  if (fm.gap < 120) {
    if (fm.state !== 'lunge') {
      fm.state = 'lunge'; run.events.push('spotted');
      pop(run, 'SPOTTED!', '#e63b2e', tk.wx - fm.gap * 0.6 - 60, 250);
    }
  } else fm.state = 'chase';
  if (fm.gap <= 0) { finish(run, 'caught'); return; }

  // Stage changes by distance.
  const meters = distanceOf(run);
  const next = STAGES[run.stage + 1];
  if (next && meters >= next.from) {
    run.stage++;
    run.banner = { text: next.name, sub: next.warn, t: 2.4 };
    run.events.push('stage');
  }

  // Spawning ahead of the camera, never past the exit.
  while (run.nextSpawnX < tk.wx + VIEW.w + 200 && run.nextSpawnX < DOOR_X - 500) {
    run.nextSpawnX = spawn(run, run.nextSpawnX);
  }

  updateEntities(run, dt);
  if (tk.wx >= DOOR_X) finish(run, 'escaped');
}

function updateEntities(run, dt) {
  const tk = run.turkey;
  const box = turkeyBox(tk);
  for (const e of run.entities) {
    if (e.type === 'oven') {
      const ph = (run.t + e.phase) % e.period;
      const fireStart = e.period - 0.55;
      const wasFiring = e.firing;
      e.firing = ph >= fireStart;
      e.heat = Math.min(1, ph / fireStart);
      if (e.firing && !wasFiring && Math.abs(e.wx - tk.wx) < 500) run.events.push('fire');
    } else if (e.type === 'knifeFly') {
      e.wx += e.vx * dt;
      if (!e.whooshed && e.wx - tk.wx < 380) { e.whooshed = true; run.events.push('whoosh'); }
    } else if (e.type === 'knifeDrop' && !e.stuck) {
      if (!e.falling && e.wx - tk.wx < e.trigger) e.falling = true;
      if (e.falling) {
        e.vy -= 1500 * dt; e.y += e.vy * dt;
        if (e.y <= 30) { e.y = 30; e.stuck = true; run.shake = Math.max(run.shake, 0.08); }
      }
    } else if (e.type === 'corn' && !e.taken) {
      if (overlaps(box, { l: e.wx - 12, r: e.wx + 12, b: e.y - 14, t: e.y + 14 })) {
        e.taken = true; run.corn++;
        run.farmer.gap = Math.min(F.maxGap, run.farmer.gap + 12);
        burst(run, e.wx, e.y, 6, 'corn');
        pop(run, '+50', '#f5cd30', e.wx, e.y + 30);
        run.events.push('corn');
      }
      continue;
    } else if (e.type === 'pie' && !e.taken) {
      if (overlaps(box, { l: e.wx - 20, r: e.wx + 20, b: e.y - 14, t: e.y + 14 })) {
        e.taken = true; run.pies++;
        if (tk.lives < T.lives) { tk.lives++; pop(run, 'PIE! +1 LIFE', '#5fae4b', e.wx, e.y + 30); }
        else { run.bonus += 200; pop(run, 'PIE! +200', '#f5cd30', e.wx, e.y + 30); }
        burst(run, e.wx, e.y, 8, 'corn');
        run.events.push('pie');
      }
      continue;
    } else if (e.type === 'hay') {
      if (!e.used && tk.ducking && tk.onGround && Math.abs(e.wx - tk.wx) < 40) {
        tk.hidden = e; tk.hideT = 0; tk.ducking = false;
        burst(run, e.wx, 50, 8, 'straw');
        run.events.push('hide');
      }
      continue;
    }

    // Damage and near misses.
    if (tk.invuln > 0) continue;
    const boxes = hazardBoxes(e);
    if (boxes.some((b) => overlaps(box, b))) { hurt(run); e.hit = true; if (tk.lives <= 0) finish(run, 'caught'); return; }
    if (!e.hit && boxes.some((b) => overlaps(box, b, 18))) e.close = true;
    const right = e.type === 'oven' ? e.wx + 34 : e.type === 'knifeFly' ? e.wx + 46 : e.wx + (e.w || 14) / 2;
    if (e.close && !e.hit && !e.counted && right < box.l) {
      e.counted = true; run.nearMisses++;
      pop(run, 'CLOSE SHAVE! +25', '#fff4e0', tk.wx, tk.y + 100);
      run.events.push('nearMiss');
    }
  }
  const cam = camXOf(run);
  run.entities = run.entities.filter((e) => e.wx > cam - 200 && !((e.type === 'corn' || e.type === 'pie') && e.taken));
}

function updateEffects(run, dt) {
  for (const p of run.particles) {
    p.life -= dt; p.vy -= 700 * dt; p.wx += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.y < 0) { p.y = 0; p.vy *= -0.3; p.vx *= 0.7; }
  }
  run.particles = run.particles.filter((p) => p.life > 0);
  for (const q of run.pops) { q.t -= dt; q.y += 40 * dt; }
  run.pops = run.pops.filter((q) => q.t > 0);
}
