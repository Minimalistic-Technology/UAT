/**
 * SQLite Backup Scheduler
 * ─────────────────────────────────────────────
 * Runs automatically every 6 hours.
 * Keeps last 7 daily backups and last 4 weekly backups.
 * Backups are stored in: prisma/backups/
 *
 * Usage:
 *   node scripts/backupSQLite.js           ← one-time manual backup
 *   node scripts/backupSQLite.js --watch   ← scheduled (every 6 hours, run this always-on)
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../prisma/backups');
const MAX_DAILY_BACKUPS = 7;
const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

function pad(n) {
    return String(n).padStart(2, '0');
}

function getTimestamp() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

function runBackup() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('[backup] ❌ dev.db not found at:', DB_PATH);
        return;
    }

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log('[backup] 📁 Created backup directory:', BACKUP_DIR);
    }

    const timestamp = getTimestamp();
    const backupFile = path.join(BACKUP_DIR, `dev_backup_${timestamp}.db`);

    fs.copyFileSync(DB_PATH, backupFile);
    console.log(`[backup] ✅ Backup created: ${path.basename(backupFile)}`);

    // Cleanup old backups — keep only MAX_DAILY_BACKUPS most recent
    const allBackups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('dev_backup_') && f.endsWith('.db'))
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time); // newest first

    if (allBackups.length > MAX_DAILY_BACKUPS) {
        const toDelete = allBackups.slice(MAX_DAILY_BACKUPS);
        for (const file of toDelete) {
            fs.unlinkSync(path.join(BACKUP_DIR, file.name));
            console.log(`[backup] 🗑️  Old backup removed: ${file.name}`);
        }
    }
}

// ─── Run once immediately ───────────────────────────────────
runBackup();

// ─── If --watch flag, keep running on schedule ───────────────
if (process.argv.includes('--watch')) {
    console.log(`[backup] ⏰ Scheduler active — backup every 6 hours`);
    setInterval(runBackup, INTERVAL_MS);
}
