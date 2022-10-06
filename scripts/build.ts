import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

import pkg from '../package.json';

const cwd = process.cwd();
const publicDirectory = path.resolve(cwd, 'public');
const packagesDirectory = path.resolve(cwd, 'packages');

function buildSubModules() {
  return new Promise((resolve, reject) => {
    const ps = exec(`npm run build --workspaces`);

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

async function moveDistDirectory(source: string, target: string) {
  try {
    await buildSubModules();
  } catch (error) {
    console.error('Build submodules failed');
    throw error;
  }
  const subModules = pkg.workspaces.map(w => w.split('/')[1]);

  for (const m of subModules) {
    const src = path.resolve(source, m, 'dist');
    const dist = path.resolve(target, m);
    try {
      await fs.cp(src, dist, {
        force: true,
        recursive: true,
      });
    } catch (error) {
      console.error(error);
      console.log(`Copy files from ${src} to ${dist} is failed`);
    }
  }
}

moveDistDirectory(packagesDirectory, publicDirectory)
  .then(() => console.log('SUBMODULES building is SUCCESSFUL'))
  .catch(e => {
    console.error(e);
    console.log('SUBMODULES building is FAILED');
  });
