import axios from "axios";

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

interface WhatsAppMessage {
  to: string;
  templateName: string;
  languageCode?: string;

  // Add these for your order confirmation template
  orderId?: string;
  hotelName?: string;
  totalAmount?: string;
}

export const sendWhatsAppMessage = async (message: WhatsAppMessage) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: message.to,
        type: "template",
        template: {
          name: message.templateName,
          language: {
            code: message.languageCode || "en_US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Message sent:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("Error sending message:", err.response?.data || err.message);
    throw err;
  }
};
