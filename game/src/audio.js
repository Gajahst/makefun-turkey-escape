// Every sound is synthesised with Web Audio at run time: no audio files, no network.
// Sound effects are short envelopes on oscillators and a noise buffer; the music is a
// little banjo-ish loop in a major pentatonic scale that speeds up in the kitchen.

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let noise = null;
  let muted = false;
  let musicTimer = 0;
  let step = 0;
  let tempo = 0.16;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return true;
  }

  function tone(freq, dur, { type = 'square', vol = 0.3, slide = 0, delay = 0, out } = {}) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(out || master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function hiss(dur, { vol = 0.3, freq = 1200, delay = 0 } = {}) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur);
  }

  const sfx = {
    jump: () => tone(380, 0.16, { slide: 420, vol: 0.18 }),
    corn: () => { tone(880, 0.07, { vol: 0.15 }); tone(1320, 0.1, { vol: 0.15, delay: 0.06 }); },
    pie: () => [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.12, { type: 'triangle', vol: 0.16, delay: i * 0.05 })),
    gobble() {
      for (let i = 0; i < 4; i++) tone(520 - i * 40, 0.06, { type: 'sawtooth', vol: 0.12, slide: -160, delay: i * 0.07 });
    },
    hit: () => { hiss(0.25, { vol: 0.35, freq: 600 }); tone(200, 0.3, { type: 'sawtooth', slide: -150, vol: 0.25 }); },
    whoosh: () => hiss(0.18, { vol: 0.18, freq: 2400 }),
    dash: () => { hiss(0.22, { vol: 0.2, freq: 1600 }); tone(300, 0.2, { slide: 500, vol: 0.12, type: 'triangle' }); },
    fire: () => hiss(0.4, { vol: 0.22, freq: 400 }),
    hide: () => { hiss(0.2, { vol: 0.2, freq: 900 }); tone(240, 0.12, { type: 'triangle', vol: 0.14 }); },
    spotted: () => { tone(660, 0.08, { vol: 0.2 }); tone(990, 0.16, { vol: 0.2, delay: 0.08 }); },
    nearMiss: () => tone(1180, 0.08, { type: 'triangle', vol: 0.12, slide: 300 }),
    stage: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.18, delay: i * 0.09 })),
    caught: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { type: 'sawtooth', vol: 0.18, delay: i * 0.18 })),
    escaped: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'square', vol: 0.15, delay: i * 0.1 })),
    click: () => tone(700, 0.05, { vol: 0.12 }),
  };

  // Pentatonic banjo loop: root C, bars of 8 eighth notes.
  const melody = [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2];
  const bass = [0, 0, 7, 7, 5, 5, 7, 7];
  const semis = (n) => 262 * Math.pow(2, n / 12);

  function updateMusic(dt, playing, intensity) {
    if (!ctx || muted || !playing) return;
    tempo = 0.17 - intensity * 0.04;
    musicTimer -= dt;
    if (musicTimer > 0) return;
    musicTimer += tempo;
    const m = melody[step % melody.length];
    tone(semis(m), tempo * 0.9, { type: 'triangle', vol: 0.5, out: musicGain });
    if (step % 2 === 0) tone(semis(bass[(step / 2) % bass.length] - 24), tempo * 1.8, { type: 'square', vol: 0.25, out: musicGain });
    step++;
  }

  return {
    unlock() { if (ensure() && ctx.state === 'suspended') ctx.resume(); },
    play(name) { if (sfx[name]) sfx[name](); },
    updateMusic,
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
  };
}
