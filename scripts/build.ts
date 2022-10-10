import path from 'path';

import { buildModule, moveModule } from './utils';

const pkg = require('../package.json');

const buildAllSubModules = () =>
  Promise.all(
    pkg.workspaces
      .map((w: string) => w.split('/')[1])
      .map((m: string) => buildModule(m))
  );

const moveSubModulesDistDirectory = (source: string, target: string) =>
  Promise.all(
    pkg.workspaces
      .map((w: string) => w.split('/')[1])
      .filter((w: string) => w !== 'main')
      .map((m: string) => {
        const src = path.resolve(source, m, 'dist');
        const dist = path.resolve(target, m);
        moveModule(src, dist);
      })
  );

const cwd = process.cwd();

const distDirectory = path.resolve(cwd, 'dist');

const mainAppDist = path.resolve(cwd, 'packages/main/dist');
const packagesDirectory = path.resolve(cwd, 'packages');

async function build() {
  try {
    await buildAllSubModules();
    console.log('[BUILDING] all modules is SUCCESSFUL');
  } catch (error) {
    console.error(error);
    console.log('[BUILDING] all modules is FAILED');
  }

  try {
    await moveModule(mainAppDist, distDirectory);
    console.log('[MOVING] main is SUCCESSFUL');
  } catch (error) {
    console.error(error);
    console.log('[MOVING] main is FAILED');
  }

  try {
    await moveSubModulesDistDirectory(packagesDirectory, distDirectory);
    console.log('[MOVING] submodules is SUCCESSFUL');
  } catch (error) {
    console.error(error);
    console.log('[MOVING] submodules content is FAILED');
  }
}

build();
