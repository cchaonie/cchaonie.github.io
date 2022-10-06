import fs from 'fs/promises';
import path from 'path';
import pkg from '../package.json';

const cwd = process.cwd();
const publicDirectory = path.resolve(cwd, 'public');
const packagesDirectory = path.resolve(cwd, 'packages');

async function moveDistDirectory(source: string, target: string) {
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
