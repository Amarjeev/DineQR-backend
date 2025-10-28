import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set.");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

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
    await sgMail.send({
      to: toEmail,
      from: process.env.EMAIL_USER as string,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
