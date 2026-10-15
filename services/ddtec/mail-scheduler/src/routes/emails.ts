import express, { Request, Response } from 'express';
import crypto from 'crypto';
import db from '../db';
import { dispatch } from '../scheduler';
import { ScheduledEmailRow } from '../types';

const router = express.Router();

function rowToJson(row: ScheduledEmailRow) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    html: row.html,
    recipientType: row.recipient_type,
    recipients: JSON.parse(row.recipients),
    templateId: row.template_id,
    scheduledAt: row.scheduled_at,
    status: row.status,
    sentAt: row.sent_at,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    errorMessage: row.error_message,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeRecipients(recipientType: unknown, recipients: unknown): string[] {
  if (Array.isArray(recipients)) {
    return recipients.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof recipients === 'string') {
    return recipients.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

// POST /emails — create (and optionally immediately dispatch) a scheduled email
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subject, html, recipientType, recipients, scheduledAt, createdBy, templateId } = req.body;

    if (!title || !subject || !html || !scheduledAt) {
      return res.status(400).json({ success: false, msg: 'title, subject, html and scheduledAt are required.' });
    }

    const targetDate = new Date(scheduledAt);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, msg: 'Invalid scheduledAt date/time.' });
    }

    const recipientList = normalizeRecipients(recipientType, recipients);
    if (recipientList.length === 0) {
      return res.status(400).json({ success: false, msg: 'At least one recipient email address is required.' });
    }

    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO scheduled_emails
        (id, title, subject, html, recipient_type, recipients, template_id, scheduled_at, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(id, title, subject, html, recipientType || 'custom', JSON.stringify(recipientList), templateId || 'custom', targetDate.toISOString(), createdBy || null);

    let row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(id) as ScheduledEmailRow;

    // If the requested time is now-or-past, dispatch immediately rather than waiting for the next cron tick.
    const isImmediate = targetDate.getTime() <= Date.now() + 1000;
    if (isImmediate) {
      await dispatch(row);
      row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(id) as ScheduledEmailRow;
    }

    res.status(201).json({ success: true, scheduledEmail: rowToJson(row) });
  } catch (err: any) {
    console.error('[EMAILS] create failed:', err);
    res.status(500).json({ success: false, msg: 'Failed to create scheduled email.', error: err.message });
  }
});

// GET /emails — list, optional ?status=pending|sent|failed|cancelled
router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  const rows = (status && status !== 'all'
    ? db.prepare('SELECT * FROM scheduled_emails WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM scheduled_emails ORDER BY created_at DESC').all()) as ScheduledEmailRow[];

  res.json({ success: true, emails: rows.map(rowToJson) });
});

// GET /emails/:id
router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(req.params.id) as ScheduledEmailRow | undefined;
  if (!row) return res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
  res.json({ success: true, scheduledEmail: rowToJson(row) });
});

// PATCH /emails/:id — edit a still-pending job
router.patch('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(req.params.id) as ScheduledEmailRow | undefined;
  if (!row) return res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
  if (row.status !== 'pending') {
    return res.status(400).json({ success: false, msg: `Cannot edit email with status '${row.status}'.` });
  }

  const { title, subject, html, recipientType, recipients, scheduledAt, templateId } = req.body;

  const next = {
    title: title ?? row.title,
    subject: subject ?? row.subject,
    html: html ?? row.html,
    recipient_type: recipientType ?? row.recipient_type,
    recipients: recipients !== undefined ? JSON.stringify(normalizeRecipients(recipientType ?? row.recipient_type, recipients)) : row.recipients,
    template_id: templateId ?? row.template_id,
    scheduled_at: row.scheduled_at
  };

  if (scheduledAt) {
    const targetDate = new Date(scheduledAt);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, msg: 'Invalid scheduledAt date/time.' });
    }
    next.scheduled_at = targetDate.toISOString();
  }

  db.prepare(
    `UPDATE scheduled_emails
     SET title = ?, subject = ?, html = ?, recipient_type = ?, recipients = ?, template_id = ?, scheduled_at = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(next.title, next.subject, next.html, next.recipient_type, next.recipients, next.template_id, next.scheduled_at, row.id);

  const updated = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(row.id) as ScheduledEmailRow;
  res.json({ success: true, scheduledEmail: rowToJson(updated) });
});

// DELETE /emails/:id — cancel (only pending jobs)
router.delete('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(req.params.id) as ScheduledEmailRow | undefined;
  if (!row) return res.status(404).json({ success: false, msg: 'Scheduled email not found.' });

  if (row.status === 'pending') {
    db.prepare(`UPDATE scheduled_emails SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(row.id);
  }

  res.json({ success: true, msg: 'Scheduled email cancelled.' });
});

// POST /emails/:id/send-now — the "submit for immediate send" action
router.post('/:id/send-now', async (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(req.params.id) as ScheduledEmailRow | undefined;
  if (!row) return res.status(404).json({ success: false, msg: 'Scheduled email not found.' });

  if (row.status === 'sent') {
    return res.status(400).json({ success: false, msg: 'This email has already been sent.' });
  }

  const result = await dispatch(row);
  const updated = db.prepare('SELECT * FROM scheduled_emails WHERE id = ?').get(row.id) as ScheduledEmailRow;

  if (result.success) {
    res.json({ success: true, msg: 'Email dispatched immediately.', scheduledEmail: rowToJson(updated) });
  } else {
    res.status(500).json({ success: false, msg: `Failed to dispatch email: ${result.error}`, scheduledEmail: rowToJson(updated) });
  }
});

export default router;
