// A tiny seeded random generator (mulberry32) so a run, and every screenshot, can be replayed.

export function makeRandom(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (a, b) => a + (b - a) * next(),
    int: (a, b) => Math.floor(a + (b - a + 1) * next()),
    pick(weights) {
      const keys = Object.keys(weights);
      const total = keys.reduce((sum, k) => sum + weights[k], 0);
      let r = next() * total;
      for (const k of keys) { r -= weights[k]; if (r <= 0) return k; }
      return keys[keys.length - 1];
    },
  };
}
