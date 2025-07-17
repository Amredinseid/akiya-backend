import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import userRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import favoriteRoutes from './routes/favorites.js';
import orderRoutes from './routes/orders.js';
import deliveryRoutes, { setupDeliverySocket } from './routes/delivery.js';

const app = express();
const server = createServer(app); // Needed for socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes); // 📦
app.get('/', (req, res) => {
  res.send('Akiya Backend is Running ✅');
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Socket Delivery Logic
setupDeliverySocket(io); // 🧠 Activate live delivery location

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
