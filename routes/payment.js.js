import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 🔧 Multer setup (for optional image upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/receipts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 🧾 POST /api/payment/submit
router.post('/submit', upload.single('receiptImage'), async (req, res) => {
  try {
    const { method, receiptCode, totalAmount, cartItems, quantities } =
      req.body;

    const receiptImagePath = req.file ? req.file.path : null;

    // Save to MongoDB (example only)
    const order = {
      method,
      receiptCode,
      totalAmount,
      cartItems: JSON.parse(cartItems),
      quantities: JSON.parse(quantities),
      receiptImage: receiptImagePath,
      submittedAt: new Date(),
    };

    // Replace with actual DB insert
    console.log('✅ Received payment:', order);

    res.status(200).json({ success: true, message: 'Payment submitted.' });
  } catch (err) {
    console.error('❌ Error:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to submit payment.' });
  }
});

export default router;
