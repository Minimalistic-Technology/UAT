import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS loaded:", !!process.env.SMTP_PASS);

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

  return transporter.sendMail({
    from: `"Admin Auth" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
