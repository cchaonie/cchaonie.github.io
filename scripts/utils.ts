import { exec } from 'child_process';
import fs from 'fs/promises';

export async function buildModule(moduleName: string) {
  return await new Promise((resolve, reject) => {
    const ps = exec(`npm run build -w ${moduleName}`);

    ps.on('close', code => {
      console.log(`[BUILD MODULE] ${moduleName} is SUCCESSFUL`);
      resolve(code);
    });

    ps.on('error', error => {
      console.log(`[BUILD MODULE] ${moduleName} is FAILED`);
      reject(error);
    });
  });
}

export async function moveModule(src: string, dist: string) {
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
