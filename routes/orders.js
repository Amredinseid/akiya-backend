// server.js or routes/orders.js

import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Storage for receipt images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/receipts'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/create', upload.single('receipt'), async (req, res) => {
  try {
    const {
      pickupAddress,
      dropoffAddress,
      vehicleType,
      deliveryTime,
      paymentMethod,
      total,
      cartItems,
      quantities,
    } = req.body;

    // You can parse cartItems & quantities if sent as JSON strings
    const receiptPath = req.file?.path || '';

    // Validate fields (add your validation)

    // Save order to DB (MongoDB example)
    const newOrder = {
      pickupAddress,
      dropoffAddress,
      vehicleType,
      deliveryTime,
      paymentMethod,
      total,
      cartItems: JSON.parse(cartItems),
      quantities: JSON.parse(quantities),
      receiptPath,
      status: 'Pending',
      createdAt: new Date(),
    };

    // Example: await OrderModel.create(newOrder);

    return res.status(200).json({ message: 'Order created successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
