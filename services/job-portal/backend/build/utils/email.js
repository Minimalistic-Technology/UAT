import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
// Determine which email service to use based on configuration
const useSendGridAPI = config.emailHost === 'smtp.sendgrid.net' && config.emailUser === 'apikey';
if (useSendGridAPI) {
    // Initialize SendGrid with API key
    if (config.emailPass) {
        sgMail.setApiKey(config.emailPass);
        console.log('✅ SendGrid API initialized (using HTTP API instead of SMTP)');
    }
    else {
        console.warn('⚠️ SendGrid API key missing. Email functionality will not work.');
    }
}
// Legacy SMTP transporter for other email providers (Gmail, Mailgun, etc.)
let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        // Validate required email configuration
        if (!config.emailHost || !config.emailUser || !config.emailPass) {
            console.error('❌ Email configuration missing:', {
                hasHost: !!config.emailHost,
                hasUser: !!config.emailUser,
                hasPass: !!config.emailPass,
            });
            throw new Error('Email configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.');
        }
        console.log('📧 Initializing email transporter...', {
            host: config.emailHost,
            port: config.emailPort,
            user: config.emailUser,
            secure: config.emailPort === 465,
        });
        transporter = nodemailer.createTransport({
            host: config.emailHost,
            port: config.emailPort,
            secure: config.emailPort === 465,
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 30000,
            tls: {
                rejectUnauthorized: config.nodeEnv === 'production',
                minVersion: 'TLSv1.2',
            },
            debug: config.nodeEnv === 'development',
            logger: config.nodeEnv === 'development',
        });
        console.log('✅ Email transporter initialized successfully');
    }
    return transporter;
};
export const sendEmail = async (options) => {
    try {
        // Use SendGrid API if configured
        if (useSendGridAPI) {
            console.log('📤 Sending email via SendGrid API to:', options.email);
            const msg = {
                to: options.email,
                from: {
                    email: config.emailFrom || 'meetsanwadkarofficial@gmail.com', // Verified sender
                    name: 'Job Portal'
                },
                subject: options.subject,
                text: options.message,
                html: `<div style="font-family: sans-serif; line-height: 1.6;">
                     <h2>${options.subject}</h2>
                     <p>${options.message}</p>
                     <p>If you did not request this email, please ignore it.</p>
                   </div>`,
            };
            await sgMail.send(msg);
            console.log('✅ Email sent successfully via SendGrid API');
            return;
        }
        // Fall back to SMTP for other providers
        const emailTransporter = getTransporter();
        if (config.nodeEnv === 'development') {
            await emailTransporter.verify();
            console.log('✅ Email server is ready to send messages');
        }
        const mailOptions = {
            from: `Job Portal <${config.emailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: `<div style="font-family: sans-serif; line-height: 1.6;">
                 <h2>${options.subject}</h2>
                 <p>${options.message}</p>
                 <p>If you did not request this email, please ignore it.</p>
               </div>`,
        };
        const info = await emailTransporter.sendMail(mailOptions);
        if (config.nodeEnv === 'development') {
            console.log('✉️  Email sent successfully:', info.messageId);
        }
    }
    catch (error) {
        console.error('❌ Email sending failed:', error.message);
        // Log full error details for debugging
        if (error.response) {
            console.error('SendGrid API Error Response:', {
                body: error.response.body,
                statusCode: error.response.statusCode,
            });
        }
        // Provide more specific error messages for debugging
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please verify EMAIL_USER and EMAIL_PASS credentials.');
        }
        else if (error.code === 'ECONNECTION') {
            throw new Error('Could not connect to email server. Please check EMAIL_HOST and EMAIL_PORT.');
        }
        else if (error.code === 'ETIMEDOUT') {
            throw new Error('Email server connection timed out. Please check your network or try again later.');
        }
        // Re-throw the original error if not a known case
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
// Graceful shutdown - close connection pool when app terminates
export const closeEmailConnection = async () => {
    if (transporter) {
        transporter.close();
        transporter = null;
        console.log('📧 Email connection pool closed');
    }
};
