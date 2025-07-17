import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

const APP_ID = '1446641021977608'; // Your Telebirr Fabric AppID
const APP_KEY = 'fad0f06383c6297f545876694b974599'; // Your AppKey
const SHORT_CODE = '905400'; // Your shortCode
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
YOUR_RSA_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----`;

const NOTIFY_URL = 'https://192.168.126.240/api/telebirr/callback'; // Publicly accessible URL!

// Generate receiveCode for Telebirr payment
router.post('/receive', async (req, res) => {
  const { amount } = req.body;

  const payload = {
    appId: APP_ID,
    appKey: APP_KEY,
    nonce: crypto.randomUUID(),
    outTradeNo: Date.now().toString(), // unique order id for tracking
    totalAmount: amount,
    subject: 'Akiya Spare Part Order',
    timeoutExpress: '15m',
    notifyUrl: NOTIFY_URL,
    receiveName: 'Akiya Spare',
    shortCode: SHORT_CODE,
  };

  const jsonStr = JSON.stringify(payload);
  const encrypted = crypto.publicEncrypt(PUBLIC_KEY, Buffer.from(jsonStr));

  try {
    const { data } = await axios.post(
      'https://app.ethiotelecom.et/api/inapp/order',
      {
        appId: APP_ID,
        sign: encrypted.toString('base64'),
      }
    );
    return res.json({
      receiveCode: data.receiveCode,
      outTradeNo: payload.outTradeNo,
    });
  } catch (err) {
    console.error('Telebirr error:', err?.response?.data || err.message);
    return res.status(500).json({ message: 'Telebirr API failed' });
  }
});

// Telebirr payment callback webhook
router.post('/callback', async (req, res) => {
  const paymentData = req.body;
  console.log('✅ Payment callback received:', paymentData);

  // TODO: Here you should verify signature & data authenticity per Telebirr docs!

  try {
    // Extract order id and payment status from paymentData
    const { outTradeNo, tradeStatus, totalAmount } = paymentData;

    if (tradeStatus === 'SUCCESS') {
      // Save or update your order in DB as paid
      // Example with mongoose (replace with your DB logic):

      // await OrderModel.findOneAndUpdate(
      //   { outTradeNo },
      //   {
      //     status: 'Paid',
      //     paymentData,
      //     paidAt: new Date(),
      //   },
      //   { upsert: true }
      // );

      console.log(`Order ${outTradeNo} marked as Paid.`);

      res.status(200).send('OK');
    } else {
      console.log(`Payment status is not success: ${tradeStatus}`);
      res.status(400).send('Payment failed or invalid');
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).send('Server error');
  }
});

export default router;
