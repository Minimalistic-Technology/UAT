const cron = require('node-cron');
const { runDueJobs } = require('./scheduler');

let running = false;

function startCronLoop() {
  // Every 30 seconds.
  cron.schedule('*/30 * * * * *', async () => {
    if (running) return; // skip overlap if a previous pass is still sending
    running = true;
    try {
      const results = await runDueJobs();
      if (results.length > 0) {
        console.log(`[CRON] Processed ${results.length} due email(s):`, results);
      }
    } catch (err) {
      console.error('[CRON-ERROR] runDueJobs failed:', err);
    } finally {
      running = false;
    }
  });
  console.log('[CRON] Mail scheduler loop started (every 30s).');
}

module.exports = { startCronLoop };
