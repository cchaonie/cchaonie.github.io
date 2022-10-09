import express from 'express';
import path from 'path';
import fs from 'fs/promises';

import { buildModule, moveModule } from './utils';

const cwd = process.cwd();

async function watchModule(moduleName: string, ...folders: string[]) {
  for (const folder of folders) {
    const events = fs.watch(path.resolve(cwd, 'packages', moduleName, folder), {
      recursive: true,
    });

    for await (const e of events) {
      console.log(`[FILE UPDATE] detected: ${e.eventType}----${e.filename}`);
      await buildModule(moduleName);
      await moveModule(
        path.resolve(cwd, 'packages', moduleName, 'dist'),
        path.resolve(cwd, 'dist', moduleName)
      );
    }
  }
}

const app = express();
const port = 3301;

app.use(express.static(path.resolve(cwd, 'dist')));

app.listen(port, async () => {
  console.log(`[DEV-SERVER] is listening on port ${port}`);
  await watchModule('blogs', 'source');
});
