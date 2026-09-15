import dotenv from 'dotenv';
dotenv.config({ quiet: true } as any);

import express from 'express';
import cors from 'cors';

import { requireApiKey } from './auth';
import emailsRouter from './routes/emails';
import { startCronLoop } from './cron';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Unauthenticated liveness/readiness probe for Docker healthcheck.
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/emails', requireApiKey, emailsRouter);

const PORT = process.env.PORT || 6100;

app.listen(PORT, () => {
  console.log(`[MAIL-SCHEDULER] Listening on port ${PORT}`);
  startCronLoop();
});
