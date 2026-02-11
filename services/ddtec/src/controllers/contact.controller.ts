import { Request, Response } from 'express';
import Contact from '../models/Contact';
import NotificationService from '../services/notification.service';
import ValidationService from '../services/validation.service';

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

        // 3. Send Email Notification
        const emailValidation = ValidationService.isRealEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({ msg: emailValidation.msg });
        }

        const sent = await NotificationService.sendContactNotification({ firstName, lastName, email, message });

        if (sent) {
            res.status(201).json({ msg: 'Message sent and saved successfully', contact: savedContact });
        } else {
            res.status(201).json({ msg: 'Message saved, but notification failed.', contact: savedContact });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
