import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

import pkg from '../package.json';

// TODO: use top level async/await in typescript
function buildSubModules() {
  return new Promise((resolve, reject) => {
    const ps = exec(`npm run build --workspaces`);

    ps.stdin?.on('data', data => console.log(data));
    ps.stderr?.on('data', data => console.error(data));

    ps.on('close', code => {
      console.log(`child process exited with code ${code}`);
      resolve(code);
    });

    ps.on('error', error => {
      console.log(`${error} happens when executing sub process`);
      reject(error);
    });
  });
}

async function moveSubModulesDistDirectory(source: string, target: string) {
  const subModules = pkg.workspaces
    .map(w => w.split('/')[1])
    .filter(w => w !== 'main');

  for (const m of subModules) {
    const src = path.resolve(source, m, 'dist');
    const dist = path.resolve(target, m);
    try {
      await fs.cp(src, dist, {
        force: true,
        recursive: true,
      });
      console.log(`[COPY FILES] from ${src} to ${dist} is SUCCESSFUL`);
    } catch (error) {
      console.error(error);
      console.log(`[COPY FILES] from ${src} to ${dist} is FAILED`);
    }
  }
}

async function moveMainAppDistDirectory(source: string, target: string) {
  try {
    await fs.cp(source, target, {
      force: true,
      recursive: true,
    });
    console.log(`[MOVING] MAIN APP DIST is SUCCESSFUL`);
  } catch (error) {
    console.error(error);
    console.log(`[MOVING] MAIN APP DIST is FAILED`);
  }
}

export function build() {
  const cwd = process.cwd();

  const distDirectory = path.resolve(cwd, 'dist');
  const packagesDirectory = path.resolve(cwd, 'packages');
  const mainAppDist = path.resolve(cwd, 'packages/main/dist');

  return buildSubModules()
    .then(() => moveSubModulesDistDirectory(packagesDirectory, distDirectory))
    .then(() => moveMainAppDistDirectory(mainAppDist, distDirectory))
    .then(() => {
      console.log('[MOVING] whole content is SUCCESSFUL');
    })
    .catch(e => {
      console.error(e);
      console.log('[MOVING] whole content is FAILED');
    });
}

build();
