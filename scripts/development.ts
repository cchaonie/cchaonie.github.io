import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { build } from './build';

// watch the changes and restart the dev server
async function watchSourceChange() {
  const cwd = process.cwd();
  const events = fs.watch(path.resolve(cwd, 'packages'), {
    recursive: true,
  });

  for await (const e of events) {
    console.log(`[FILE CHANGE] detected: ${e.eventType}-${e.filename}`);
    if (e.eventType === 'change') {
      build().then(() => {
        console.log('[UPDATE] site is SUCCESSFUL');
      });
    }
  }
}

const app = express();
const port = 3301;

app.use(express.static(path.resolve(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`[DEV-SERVER] is listening on port ${port}`);
  // watchSourceChange().then(() => console.log('[WATCHING] site changes'));
});
