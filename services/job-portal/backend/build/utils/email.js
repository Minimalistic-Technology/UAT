import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.emailUser,
            pass: config.emailPass,
        },
    });
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
    await transporter.sendMail(mailOptions);
};
