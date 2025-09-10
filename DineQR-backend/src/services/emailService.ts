import * as SibApiV3Sdk from '@sendinblue/client';
import dotenv from 'dotenv';
dotenv.config();


// Initialize Brevo client
const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY as string
);

interface SendEmailOptions {
  toEmail: string;
  subject: string;
  htmlContent: string;
}

/**
 * Send Email Function
 */
export const sendEmail = async ({ toEmail, subject, htmlContent }: SendEmailOptions) => {
  // Instead of `new SendSmtpEmail({...})`, just create an object
  const emailData: SibApiV3Sdk.SendSmtpEmail = {
    to: [{ email: toEmail }],
    sender: { name: process.env.SENDER_NAME as string, email: process.env.SENDER_EMAIL as string },
    subject,
    htmlContent,
  };

  try {
    const response = await client.sendTransacEmail(emailData);
    console.log('Email sent:');
    return response;
  } catch (error :any) {
   console.error('Error sending email:', error.response?.body || error.message);
    throw error;
  }
};
