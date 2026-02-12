import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
// Create reusable transporter with connection pooling for better performance
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
            secure: config.emailPort === 465, // true for 465 (SSL), false for other ports (TLS)
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
            // Production-ready settings
            pool: true, // Use connection pooling for better performance
            maxConnections: 5, // Maximum simultaneous connections
            maxMessages: 100, // Maximum messages per connection
            rateDelta: 1000, // Time window for rate limiting (1 second)
            rateLimit: 5, // Max messages per rateDelta
            // Timeout configurations to prevent hanging
            connectionTimeout: 10000, // 10 seconds to establish connection
            greetingTimeout: 10000, // 10 seconds for greeting
            socketTimeout: 30000, // 30 seconds of inactivity
            // TLS options for Gmail and other secure SMTP servers
            tls: {
                rejectUnauthorized: config.nodeEnv === 'production', // Verify certificates in production
                minVersion: 'TLSv1.2', // Minimum TLS version for security
            },
            // Enable debug logging in development
            debug: config.nodeEnv === 'development',
            logger: config.nodeEnv === 'development',
        });
        console.log('✅ Email transporter initialized successfully');
    }
    return transporter;
};
export const sendEmail = async (options) => {
    try {
        const emailTransporter = getTransporter();
        // Verify connection configuration on first use (optional but recommended)
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
