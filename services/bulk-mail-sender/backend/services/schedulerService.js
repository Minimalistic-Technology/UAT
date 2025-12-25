const cron = require('node-cron');
const Email = require('../models/Email');
const Config = require('../models/Config');
const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  async isWithinScheduledTime() {
    const config = await Config.findOne();
    if (!config || !config.isActive) return false;

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if current day is in scheduled days
    if (!config.scheduleDays.includes(dayName)) {
      return false;
    }

    // Check time range
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
  }

  async processPendingEmails() {
    try {
      const withinSchedule = await this.isWithinScheduledTime();
      
      if (!withinSchedule) {
        console.log('⏰ Outside scheduled time - skipping email processing');
        return;
      }

      const pendingEmails = await Email.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      }).limit(10); // Process 10 at a time

      console.log(`📧 Processing ${pendingEmails.length} pending emails`);

      for (const email of pendingEmails) {
        await emailService.sendEmail(email._id);
        // Small delay to avoid overwhelming SMTP server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error processing emails:', error);
    }
  }

  async retryFailedEmails() {
    try {
      const withinSchedule = await this.isWithinScheduledTime();
      
      if (!withinSchedule) {
        console.log('⏰ Outside scheduled time - skipping retry');
        return;
      }

      await emailService.retryFailedEmails();
    } catch (error) {
      console.error('Error retrying failed emails:', error);
    }
  }

  initScheduler() {
    console.log('🚀 Initializing email scheduler...');

    // Process pending emails every minute
    const emailJob = cron.schedule('* * * * *', async () => {
      await this.processPendingEmails();
    });

    // Retry failed emails every 15 minutes
    const retryJob = cron.schedule('*/15 * * * *', async () => {
      await this.retryFailedEmails();
    });

    this.jobs.push(emailJob, retryJob);
    console.log('✅ Scheduler initialized');
  }

  stopScheduler() {
    this.jobs.forEach(job => job.stop());
    console.log('🛑 Scheduler stopped');
  }
}

module.exports = new SchedulerService();