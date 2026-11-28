// Run goals and medals: every run deals three goals; meeting one earns its medal for good.
// This file only decides what the goals are and whether a finished run met them;
// screens.js draws them and main.js keeps the earned medals between visits.

import { makeRandom } from './random.js';
import { distanceOf, scoreOf } from './world.js';

export const GOALS = [
  { id: 'escape',  text: 'Escape out the back door', met: (r) => r.outcome === 'escaped' },
  { id: 'kitchen', text: 'Make it to the kitchen',   met: (r) => distanceOf(r) >= 1150 },
  { id: 'corn20',  text: 'Grab 20 corn',             met: (r) => r.corn >= 20 },
  { id: 'shaves8', text: 'Pull 8 close shaves',      met: (r) => r.nearMisses >= 8 },
  { id: 'hide3',   text: 'Hide in the hay 3 times',  met: (r) => r.sneaks >= 3 },
  { id: 'pies2',   text: 'Eat 2 pumpkin pies',       met: (r) => r.pies >= 2 },
  { id: 'dash10',  text: 'Dash 10 times',            met: (r) => r.dashes >= 10 },
  { id: 'score5k', text: 'Score 5,000 points',       met: (r) => scoreOf(r) >= 5000 },
  { id: 'nohit',   text: 'Escape without a scratch', met: (r) => r.outcome === 'escaped' && r.hits === 0 },
  { id: 'allfeet', text: 'Escape with all 3 lives',  met: (r) => r.outcome === 'escaped' && r.turkey.lives === 3 },
];

// Three different goals for this run, drawn from the run's seed so a replayed seed deals the same hand.
export function pickGoals(seed) {
  const rng = makeRandom(seed * 31 + 7);
  const pool = GOALS.slice();
  const hand = [];
  while (hand.length < 3) hand.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  return hand;
}

// Which of the dealt goals this run met, and which of those are medals the player did not have yet.
export function scoreGoals(run, goals, earned) {
  return goals.map((g) => {
    const met = g.met(run);
    return { id: g.id, text: g.text, met, isNew: met && !earned.has(g.id) };
  });
}
