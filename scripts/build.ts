import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

import pkg from '../package.json';

const cwd = process.cwd();

const distDirectory = path.resolve(cwd, 'dist');
const packagesDirectory = path.resolve(cwd, 'packages');

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

async function moveMainAppDistDirectory() {
  const mainAppDist = path.resolve(cwd, 'packages/main/dist');
  try {
    await fs.cp(mainAppDist, distDirectory, {
      force: true,
      recursive: true,
    });
    console.log(`[MOVING MAIN APP DIST] is SUCCESSFUL`);
  } catch (error) {
    console.error(error);
    console.log(`[MOVING MAIN APP DIST] is FAILED`);
  }
}

buildSubModules()
  .then(() => moveSubModulesDistDirectory(packagesDirectory, distDirectory))
  .then(() => moveMainAppDistDirectory())
  .then(() => {
    console.log('[MOVING whole content] is SUCCESSFUL');
  })
  .catch(e => {
    console.error(e);
    console.log('[MOVING whole content] is FAILED');
  });
