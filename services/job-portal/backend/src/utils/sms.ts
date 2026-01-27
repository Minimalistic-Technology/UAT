import twilio from 'twilio';
import { config } from '../config/env.js';

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

export const sendOTP = async (phone: string, otp: string): Promise<void> => {
  await client.messages.create({
    body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
    from: config.twilioPhoneNumber,
    to: phone,
  });
};