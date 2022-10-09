import path from 'path';

import pkg from '../package.json';
import { buildModule, moveModule } from './utils';

// TODO: use top level async/await in typescript
function buildAllSubModules() {
  const subModules = pkg.workspaces.map(w => w.split('/')[1]);

  return Promise.all(subModules.map(m => buildModule(m)));
}

async function moveSubModulesDistDirectory(source: string, target: string) {
  const subModules = pkg.workspaces
    .map(w => w.split('/')[1])
    .filter(w => w !== 'main');

  for (const m of subModules) {
    const src = path.resolve(source, m, 'dist');
    const dist = path.resolve(target, m);
    await moveModule(src, dist);
  }
}

async function moveMainAppDistDirectory(source: string, target: string) {
  await moveModule(source, target);
}

function build() {
  const cwd = process.cwd();

  const distDirectory = path.resolve(cwd, 'dist');
  const packagesDirectory = path.resolve(cwd, 'packages');
  const mainAppDist = path.resolve(cwd, 'packages/main/dist');

  return buildAllSubModules()
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
