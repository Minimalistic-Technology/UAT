export interface ScheduledEmailRow {
  id: string;
  title: string;
  subject: string;
  html: string;
  recipient_type: string;
  recipients: string;
  template_id: string | null;
  scheduled_at: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DispatchResult {
  success: boolean;
  id: string;
  error?: string;
}
