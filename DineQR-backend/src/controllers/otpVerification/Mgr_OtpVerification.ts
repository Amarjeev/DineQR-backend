import { Router, Request, Response } from "express";
import { sendEmail } from "../../services/emailService";

const Mgr_OtpVerificationRouter = Router();


Mgr_OtpVerificationRouter.post('/api/v1/auth/manager/verify-otp', async (_req: Request, res: Response) => {
    // res.send('ffffffffffffffffffffffffffffffff')
    
  try {
    await sendEmail({
      toEmail: 'amarjeevm@gmail.com',
      subject: 'Test Email',
      htmlContent: '<h1>Hello from Brevo!</h1>',
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }

})



export default Mgr_OtpVerificationRouter;