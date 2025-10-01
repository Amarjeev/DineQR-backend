import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Log environment variables to verify they are set
console.log("SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
console.log("EMAIL_USER:", process.env.EMAIL_USER);


const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // literal "apikey"
    pass: process.env.SENDGRID_API_KEY, // your SendGrid API key
  },
});

export const sendEmail = async ({
  toEmail,
  subject,
  htmlContent,
}: {
  toEmail: string | string[];
  subject: string;
  htmlContent: string;
}) => {
  try {
    await transporter.sendMail({
      from: `"AMAR" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
