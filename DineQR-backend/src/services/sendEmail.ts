import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailOptions {
  toEmail: string | string[];
  subject: string;
  htmlContent: string;
}

export const sendEmail = async ({
  toEmail,
  subject,
  htmlContent,
}: SendEmailOptions): Promise<void> => {
  try {
    // const info =
      await transporter.sendMail({
      from: `"DineQR" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    // console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
