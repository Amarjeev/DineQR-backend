// import { Router, Request, Response } from "express";
// import Twilio from "twilio";

// const sendOtpRouter = Router();

// // Twilio credentials
// const accountSid: string = "AC8586d71daa6cfcebf59a846b66f0c306";
// const authToken: string = "af55d21ca19ee0e9eb2692ddbdf9b872";

// // Initialize Twilio client
// const client = Twilio(accountSid, authToken);

// sendOtpRouter.post("/send-order-sms", async (_req: Request, res: Response) => {
//   try {
//     // You can use a fixed number or get from request body
//     const to: string = "+917034884827"; // India number with country code
//     const body: string = "Hello! This is a test message from Twilio.";

//     const message = await client.messages.create({
//       body,
//       from: "+12182929606", // Your Twilio number
//       to,
//     });

//     console.log("Message SID:", message.sid);
//     res.status(200).json({ success: true, sid: message.sid });
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     res.status(500).json({ success: false, error });
//   }
// });

// export default sendOtpRouter;








// import { Router, Request, Response } from "express";
// import Twilio from "twilio";

// const sendWhatsappRouter = Router();

// // Twilio credentials
// const accountSid = "AC8586d71daa6cfcebf59a846b66f0c306";
// const authToken = "af55d21ca19ee0e9eb2692ddbdf9b872";

// const client = Twilio(accountSid, authToken);

// sendWhatsappRouter.post("/send-whatsapp", async (_req: Request, _res: Response) => {
//   try {
//     const message = await client.messages.create({
//       from: 'whatsapp:+14155238886', // Twilio Sandbox number
//       to: 'whatsapp:+917034884827',  // Recipient number
//       contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Approved template
//       contentVariables: JSON.stringify({
//         1: "12/1",
//         2: "3pm"
//       }),
//     });

//     console.log("WhatsApp Template Message SID:", message.sid);
//   } catch (error) {
//     console.error("Error sending WhatsApp template:", error);
//   }

// });

// export default sendWhatsappRouter;


// *******************************************************************************************


import { Router, Request, Response } from "express";
import { sendWhatsAppMessage } from "./whatsapp";

const sendWhatsappRouter = Router();

sendWhatsappRouter.post("/send-whatsapp", async (req: Request, res: Response) => {
  const { phone, template, orderId, hotelName, totalAmount } = req.body;

  if (!phone || !template || !orderId || !hotelName || !totalAmount) {
    res.status(400).json({ message: "Phone, template, orderId, hotelName, and totalAmount are required" });
    return;
  }

  try {
    const result = await sendWhatsAppMessage({
      to: phone,
      templateName: template,
      orderId,
      hotelName,
      totalAmount
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

export default sendWhatsappRouter;
