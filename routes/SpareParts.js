import express from 'express';
import SparePart from '../models/SparePart.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await SparePart.find();
  res.json(items);
});

router.post('/', async (req, res) => {
  const newItem = new SparePart(req.body);
  await newItem.save();
  res.status(201).json(newItem);
});

export default router;
