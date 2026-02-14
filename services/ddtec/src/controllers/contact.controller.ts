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

        // 3. Send Email Notification (Background - Don't await to prevent timeout)
        const emailValidation = ValidationService.isRealEmail(email);
        if (emailValidation.isValid) {
            setImmediate(() => {
                NotificationService.sendContactNotification({ firstName, lastName, email, message })
                    .catch(err => console.error('[BACKGROUND-MAIL-ERROR] Contact Notification failed:', err));
            });
        }

        // Return response immediately
        return res.status(201).json({
            msg: 'Message received successfully!',
            contact: savedContact
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
