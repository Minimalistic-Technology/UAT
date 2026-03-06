import express from "express";
import { sendMail } from "../../controllers/mail/mailController";

const router = express.Router();

router.post("/send-mail", sendMail);

export default router;
