import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  cartItems: { type: Array, required: true }, // you can make more specific if you want
  quantities: { type: Object, required: true }, // map of productId to qty
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  receiptImage: { type: String, required: true },
  status: { type: String, default: 'pending_approval' }, // 'pending_approval', 'approved', 'rejected', etc.
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
