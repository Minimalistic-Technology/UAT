const nodemailer = require('nodemailer');
const Email = require('../models/Email');
const EmailLog = require('../models/EmailLog');
const Config = require('../models/Config');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initTransporter() {
    const config = await Config.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      throw new Error('SMTP configuration not found');
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      },
       tls: {
    rejectUnauthorized: true
  }
    });

    return this.transporter;
  }

  async sendEmail(emailId) {
    try {
      const email = await Email.findById(emailId);
      
      if (!email || email.status !== 'pending') {
        return { success: false, message: 'Email not found or already processed' };
      }

      // Initialize transporter
      if (!this.transporter) {
        await this.initTransporter();
      }

      // Verify SMTP connection
      await this.transporter.verify();

      // Send to all recipients
      const results = [];
      for (const recipient of email.to) {
        try {
          const info = await this.transporter.sendMail({
            from: (await Config.findOne()).smtpUser,
            to: recipient,
            subject: email.subject,
            text: email.body,
            html: `<div>${email.body.replace(/\n/g, '<br>')}</div>`,
             headers: {
    'List-Unsubscribe': '<mailto:unsubscribe@minimalistictechnology.com>'
  }
          });

          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay

          results.push({ recipient, success: true, messageId: info.messageId });
          
          // Log success
          await EmailLog.create({
            emailId: email._id,
            action: 'sent',
            details: `Sent to ${recipient}, Message ID: ${info.messageId}`
          });
        } catch (error) {
          results.push({ recipient, success: false, error: error.message });
          
          // Log failure
          await EmailLog.create({
            emailId: email._id,
            action: 'failed',
            error: `Failed to send to ${recipient}: ${error.message}`
          });
        }
      }

      // Update email status
      const allSuccess = results.every(r => r.success);
      email.status = allSuccess ? 'sent' : 'failed';
      email.attempts += 1;
      email.sentAt = allSuccess ? new Date() : null;
      email.lastError = allSuccess ? null : JSON.stringify(results.filter(r => !r.success));
      
      await email.save();

      return {
        success: allSuccess,
        results,
        message: allSuccess ? 'Email sent successfully' : 'Some emails failed'
      };
    } catch (error) {
      console.error('Email send error:', error);
      
      // Update email with error
      const email = await Email.findById(emailId);
      if (email) {
        email.attempts += 1;
        email.lastError = error.message;
        
        const config = await Config.findOne();
        if (email.attempts >= (config?.retryAttempts || 3)) {
          email.status = 'failed';
        }
        
        await email.save();
        
        // Log error
        await EmailLog.create({
          emailId: email._id,
          action: 'failed',
          error: error.message
        });
      }

      return { success: false, error: error.message };
    }
  }

  async retryFailedEmails() {
    const config = await Config.findOne();
    const failedEmails = await Email.find({
      status: 'failed',
      attempts: { $lt: config?.retryAttempts || 3 }
    });

    console.log(`🔄 Retrying ${failedEmails.length} failed emails`);

    for (const email of failedEmails) {
      email.status = 'pending';
      await email.save();
      
      await EmailLog.create({
        emailId: email._id,
        action: 'retry',
        details: `Retry attempt ${email.attempts + 1}`
      });
      
      await this.sendEmail(email._id);
    }
  }
}

module.exports = new EmailService();