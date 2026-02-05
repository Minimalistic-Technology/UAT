import { Request, Response } from 'express';
import Contact from '../models/Contact';
import nodemailer from 'nodemailer';

export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, message, userId } = req.body;

        // 1. Validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // 2. Save to Database
        const newContact = new Contact({
            firstName,
            lastName,
            email,
            message,
            userId: userId || null
        });

        const savedContact = await newContact.save();

        // 3. Send Email
        // Ensure env vars are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
            console.error('Email credentials not set in .env');
            // We still return success because the DB save worked, but warn logs
            return res.status(201).json({ msg: 'Message saved (Email service unavailable)', contact: savedContact });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            replyTo: email, // <--- Key requirement: Reply to the sender's email
            subject: `New Contact Form Submission from ${firstName} ${lastName}`,
            html: `
                <h3>New Contact Message</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><em>Saved to Database ID: ${savedContact._id}</em></p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ msg: 'Message sent and saved successfully', contact: savedContact });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
