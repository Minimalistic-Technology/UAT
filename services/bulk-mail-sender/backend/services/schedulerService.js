const cron = require('node-cron');
const Email = require('../models/Email');
const Config = require('../models/Config');
const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  async isWithinScheduledTime(userId) {
    try {
      const config = await Config.findOne({ user: userId });
      if (!config || !config.isActive) {
        console.log('⚠️  No active config found, using default schedule');
        return true; // Allow sending if no config (for testing)
      }

      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if current day is in scheduled days
      if (!config.scheduleDays.includes(dayName)) {
        console.log(`⏰ Today (${dayName}) is not a scheduled day`);
        return false;
      }

      // Check time range
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = config.startTime.split(':').map(Number);
      const [endHour, endMin] = config.endTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      const isWithinTime = currentTime >= startTime && currentTime <= endTime;
      
      if (!isWithinTime) {
        console.log(`⏰ Current time (${now.getHours()}:${now.getMinutes()}) is outside scheduled hours (${config.startTime} - ${config.endTime})`);
      }

      return isWithinTime;
    } catch (error) {
      console.error('Error checking schedule:', error);
      return true; // Allow sending on error (for testing)
    }
  }

  async processPendingEmails() {
    try {
      const pendingEmails = await Email.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() },
        attempts: { $lt: 3 }
      })
      .populate('user')
      .limit(10)
      .sort({ scheduledFor: 1 });

      
      if (pendingEmails.length === 0) {
        console.log('📭 No pending emails to process');
        return;
      }
      
      console.log(`📧 Found ${pendingEmails.length} pending emails to process`);
      
      for (const email of pendingEmails) {
        console.log("pendingEmails",email);
        // Check if within scheduled time for this user
        const withinSchedule = await this.isWithinScheduledTime(email.user._id);
        
        if (!withinSchedule) {
          console.log(`⏰ Skipping email ${email._id} - outside scheduled time`);
          continue;
        }

        console.log(`📤 Processing email ${email._id}`);
        await emailService.sendEmail(email._id);
        
        // Small delay to avoid overwhelming SMTP server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('❌ Error processing emails:', error);
    }
  }

  async retryFailedEmails() {
    try {
      const failedEmails = await Email.find({
        status: 'pending',
        attempts: { $gte: 1, $lt: 3 }
      }).populate('user');

      console.log(`🔄 Found ${failedEmails.length} emails to retry`);

      for (const email of failedEmails) {
        const withinSchedule = await this.isWithinScheduledTime(email.user._id);
        
        if (!withinSchedule) {
          console.log(`⏰ Skipping retry for email ${email._id} - outside scheduled time`);
          continue;
        }

        await emailService.retryFailedEmails();
      }
    } catch (error) {
      console.error('❌ Error retrying failed emails:', error);
    }
  }

  initScheduler() {
    console.log('🚀 Initializing email scheduler...');

    // Process pending emails every minute
    const emailJob = cron.schedule('* * * * *', async () => {
      console.log('⏰ Scheduler tick - checking for pending emails');
      await this.processPendingEmails();
    });

    // Retry failed emails every 15 minutes
    const retryJob = cron.schedule('*/15 * * * *', async () => {
      console.log('🔄 Retry scheduler tick - checking for failed emails');
      await this.retryFailedEmails();
    });

    this.jobs.push(emailJob, retryJob);
    console.log('✅ Scheduler initialized - Emails will be processed every minute');
  }

  stopScheduler() {
    this.jobs.forEach(job => job.stop());
    console.log('🛑 Scheduler stopped');
  }
}

module.exports = new SchedulerService();