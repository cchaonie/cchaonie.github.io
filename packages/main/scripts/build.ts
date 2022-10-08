import fs from 'fs/promises';
import path from 'path';

const cwd = process.cwd();
const sourceDirectory = path.resolve(cwd, 'src');
const distDirectory = path.resolve(cwd, 'dist');

async function moveDistDirectory(source: string, target: string) {
  try {
    await fs.cp(source, target, {
      force: true,
      recursive: true,
    });
  } catch (error) {
    console.error(error);
    console.log(`Copy files from ${source} to ${target} is failed`);
  }
}

moveDistDirectory(sourceDirectory, distDirectory)
  .then(() => {
    console.log('[MAIN APP building] is SUCCESSFUL');
  })
  .catch(e => {
    console.error(e);
    console.log('[MAIN APP building] is FAILED');
  });
