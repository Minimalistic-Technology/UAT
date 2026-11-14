import db from './db';
import { sendMail } from './mailer';
import { ScheduledEmailRow, DispatchResult } from './types';

/**
 * Dispatches a single scheduled_emails row right now, regardless of its
 * scheduled_at value, and persists the resulting status.
 */
async function dispatch(row: ScheduledEmailRow): Promise<DispatchResult> {
  let recipients: string[] = [];
  try {
    recipients = JSON.parse(row.recipients);
  } catch {
    recipients = [];
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    db.prepare(
      `UPDATE scheduled_emails
       SET status = 'failed', error_message = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run('No recipients configured for this email.', row.id);
    return { success: false, id: row.id, error: 'No recipients configured for this email.' };
  }

  try {
    await sendMail({ to: recipients, subject: row.subject, html: row.html });
    db.prepare(
      `UPDATE scheduled_emails
       SET status = 'sent', sent_at = datetime('now'), sent_count = ?, failed_count = 0,
           error_message = NULL, updated_at = datetime('now')
       WHERE id = ?`
    ).run(recipients.length, row.id);
    return { success: true, id: row.id };
  } catch (err: any) {
    db.prepare(
      `UPDATE scheduled_emails
       SET status = 'failed', failed_count = ?, error_message = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(recipients.length, err.message || 'Send failed', row.id);
    return { success: false, id: row.id, error: err.message || 'Send failed' };
  }
}

/**
 * Polls for due, pending jobs and dispatches each one. Called every 30s by
 * the cron loop, and can also be invoked manually (e.g. after startup).
 */
async function runDueJobs(): Promise<DispatchResult[]> {
  const dueRows = db
    .prepare(
      `SELECT * FROM scheduled_emails
       WHERE status = 'pending' AND datetime(scheduled_at) <= datetime('now')
       ORDER BY scheduled_at ASC`
    )
    .all() as ScheduledEmailRow[];

  const results: DispatchResult[] = [];
  for (const row of dueRows) {
    results.push(await dispatch(row));
  }
  return results;
}

export { dispatch, runDueJobs };
