// src/utils/notify.js
import emailjs from '@emailjs/browser';

// --- টেলিগ্রাম কনফিগারেশন ---
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; 
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

// --- ইমেইল (EmailJS) কনফিগারেশন ---
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

// ১. টেলিগ্রাম মেসেজ পাঠানোর ফাংশন
export const sendTelegramMessage = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
};

// ২. ইমেইল নোটিফিকেশন পাঠানোর ফাংশন
export const sendEmailNotification = (templateParams) => {
  // কনফিগারেশন চেক
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('EmailJS keys are missing!');
    return;
  }

  emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY
  )
  .then((response) => {
    console.log('Email sent successfully!', response.status, response.text);
  })
  .catch((err) => {
    console.error('Email failed to send:', err);
  });
};