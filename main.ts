// Gobble Getaway, packaged for make.fun's turkey-run-game-01 (Node 22, standard library only).
//
// The game lives in game/: index.html plus small ES modules (config, input, audio, sprites,
// scenery, world, render, hud, screens, shots, main) that a desktop browser runs offline.
// This program hands it in: it copies game/ and screenshots/ next to it into the output folder
// (/output in the grader, MAKEFUN_OUTPUT_DIR locally) and writes dossier.json with the vendored
// make.fun library, so the judge reads exactly the files that ship.
//
//   node serve.ts                                  # play it at http://localhost:8080
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string, required: boolean): void {
  const from = join(root, name);
  if (!existsSync(from)) {
    if (required) throw new Error(`missing ${name}/ beside main.ts`);
    mkdirSync(join(outDir, name), { recursive: true });
    return;
  }
  cpSync(from, join(outDir, name), { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyFolder('game', true);
copyFolder('screenshots', false);

const shots = readdirSync(join(outDir, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length < 3 || shots.length > 4) throw new Error(`need 3 or 4 screenshots, found ${shots.length}`);

// Same caps as the grader's gate, so a too-big entry fails here first instead of at intake.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
