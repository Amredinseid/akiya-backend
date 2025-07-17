// routes/favorite.js
import express from 'express';
import Favorite from '../models/Favorite.js';

const router = express.Router();

router.post('/toggle', async (req, res) => {
  const { userId, productId } = req.body;
  const existing = await Favorite.findOne({ userId, productId });

  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    res.json({ favorited: false });
  } else {
    await Favorite.create({ userId, productId });
    res.json({ favorited: true });
  }
});

router.get('/:userId', async (req, res) => {
  const favorites = await Favorite.find({ userId: req.params.userId });
  res.json(favorites.map((fav) => fav.productId));
});

export default router;
