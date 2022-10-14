import { exec } from 'child_process';
import fs from 'fs/promises';

export const buildModule = (moduleName: string) =>
  new Promise((resolve, reject) => {
    exec(`npm run build -w ${moduleName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      }
      console.log(stdout);
      resolve('SUCCESS');
    });
  });

export const moveModule = async (src: string, dist: string) => {
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
};
