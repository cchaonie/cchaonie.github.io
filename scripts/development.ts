import express from 'express';
import path from 'path';

const app = express();
const port = 3301;

app.use(express.static(path.resolve(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`[DEV-SERVER] is listening on port ${port}`);
});
