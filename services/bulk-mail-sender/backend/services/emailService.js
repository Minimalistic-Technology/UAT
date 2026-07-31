const nodemailer = require('nodemailer');
const fs = require('fs');
const Email = require('../models/Email');
const EmailLog = require('../models/EmailLog');
const Config = require('../models/Config');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initTransporter(userId) {
    try {
      const config = await Config.findOne({ user: userId }).sort({ createdAt: -1 });
      
      if (!config) {
        console.log('⚠️  No SMTP configuration found for user:', userId);
        // Try to get default config
        const defaultConfig = await Config.findOne().sort({ createdAt: -1 });
        if (!defaultConfig) {
          throw new Error('SMTP configuration not found');
        }
        return this.createTransporter(defaultConfig);
      }

      return this.createTransporter(config);
    } catch (error) {
      console.error('Failed to initialize transporter:', error);
      throw error;
    }
  }

  createTransporter(config) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort == 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });

    console.log('✅ Email transporter initialized');
    return this.transporter;
  }

  async sendEmail(emailId) {
    try {
      const email = await Email.findById(emailId).populate('user');
      
      if (!email || email.status !== 'pending') {
        console.log(`⚠️  Email ${emailId} not found or already processed`);
        return { success: false, message: 'Email not found or already processed' };
      }

      console.log(`📧 Processing email ${emailId} to ${email.to.length} recipient(s)`);

      // Initialize transporter for this user
      if (!this.transporter) {
        await this.initTransporter(email.user._id);
      }

      // Verify SMTP connection
      try {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
      } catch (error) {
        console.error('❌ SMTP verification failed:', error.message);
        throw new Error('SMTP connection failed: ' + error.message);
      }

      // Get config for from address
      const config = await Config.findOne({ user: email.user._id }).sort({ createdAt: -1 });
      const fromAddress = config ? config.smtpUser : 'noreply@example.com';

      // Prepare attachments
      const attachments = [];
      if (email.attachments && email.attachments.length > 0) {
        for (const attachment of email.attachments) {
          if (fs.existsSync(attachment.path)) {
            attachments.push({
              filename: attachment.filename,
              path: attachment.path
            });
          } else {
            console.warn(`⚠️  Attachment not found: ${attachment.path}`);
          }
        }
      }

      // Send to all recipients
      const results = [];
      for (const recipient of email.to) {
        try {
          console.log(`📤 Sending to: ${recipient}`);
          
          const info = await this.transporter.sendMail({
            from: `"D. D. Tec" <${fromAddress}>`,
            to: recipient,
            subject: email.subject,
            text: email.body.replace(/<[^>]*>/g, ''),
            html: email.body,
            attachments: attachments
          });

          results.push({ recipient, success: true, messageId: info.messageId });
          
          // Log success
          await EmailLog.create({
            emailId: email._id,
            action: 'sent',
            details: `Sent to ${recipient}, Message ID: ${info.messageId}`
          });

          console.log(`✅ Sent to ${recipient} - MessageID: ${info.messageId}`);
        } catch (error) {
          console.error(`❌ Failed to send to ${recipient}:`, error.message);
          
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

      console.log(`${allSuccess ? '✅' : '⚠️'} Email ${emailId} processed - Status: ${email.status}`);

      return {
        success: allSuccess,
        results,
        message: allSuccess ? 'Email sent successfully' : 'Some emails failed'
      };
    } catch (error) {
      console.error('❌ Email send error:', error);
      
      // Update email with error
      const email = await Email.findById(emailId);
      if (email) {
        email.attempts += 1;
        email.lastError = error.message;
        
        const config = await Config.findOne({ user: email.user });
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
    try {
      const failedEmails = await Email.find({
        status: 'pending',
        attempts: { $gte: 1, $lt: 3 }
      }).populate('user');

      console.log(`🔄 Retrying ${failedEmails.length} failed emails`);

      for (const email of failedEmails) {
        await EmailLog.create({
          emailId: email._id,
          action: 'retry',
          details: `Retry attempt ${email.attempts + 1}`
        });
        
        await this.sendEmail(email._id);
      }
    } catch (error) {
      console.error('Error retrying failed emails:', error);
    }
  }
}

module.exports = new EmailService();