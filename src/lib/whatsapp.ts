import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials missing');
    return;
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.info(`WhatsApp sent to ${to}:`, message);
    return response.data;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
  }
}
