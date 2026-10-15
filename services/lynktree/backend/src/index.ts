import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[server] Lynktree backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start();
