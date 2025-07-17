import express from 'express';
import multer from 'multer';
import Product from '../models/Product.js';
import fs from 'fs';

const router = express.Router();

// Multer storage config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// POST /api/products - Add product with images and category
router.post(
  '/',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      const files = req.files;

      if (!files || !files.mainImage) {
        return res.status(400).json({ message: '❌ Main image is required' });
      }

      const product = new Product({
        name,
        description,
        price,
        category,
        mainImage: files.mainImage[0].filename,
        images: [],
      });

      ['image1', 'image2', 'image3'].forEach((key) => {
        if (files[key]) {
          product.images.push(files[key][0].filename);
        }
      });

      await product.save();
      res.status(201).json({ message: '✅ Product created', product });
    } catch (err) {
      console.error('❌ Error:', err);
      res.status(500).json({ message: '❌ Server error' });
    }
  }
);

// GET /api/products - Get all or filtered products by search or category
router.get('/', async (req, res) => {
  try {
    const search = req.query.search;
    const category = req.query.category;

    let products;

    if (category) {
      products = await Product.find({ category });
    } else if (search) {
      const regex = new RegExp(search, 'i');
      products = await Product.find({
        $or: [{ name: regex }, { description: regex }],
      });
    } else {
      products = await Product.find();
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch products' });
  }
});

// GET /api/products/:id - Get product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: '❌ Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// PUT /api/products/:id - Update product (name, description, price, category)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ message: '❌ Product not found' });
    res.json({ message: '✅ Product updated', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product and associated images
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: '❌ Product not found' });

    // Delete images from disk
    const imageFiles = [product.mainImage, ...(product.images || [])];
    imageFiles.forEach((filename) => {
      const filepath = `uploads/${filename}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });

    res.json({ message: '🗑️ Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error deleting product' });
  }
});

export default router;
