import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  otpSecret: process.env.OTP_SECRET || 'fallback_secret',

  // OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // Cloudinary
  cloudinaryName: process.env.CLOUDINARY_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',

  // Email
  emailHost: process.env.EMAIL_HOST || '',
  emailPort: parseInt(process.env.EMAIL_PORT || '587'),
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || '', // Verified sender for SendGrid
  resendApiKey: process.env.RESEND_API_KEY || '',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoFromEmail: process.env.BREVO_FROM_EMAIL || '',

  // Frontend URL
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',

  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
};

export { config };