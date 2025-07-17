import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, default: 'Uncategorized' }, // category field added
    mainImage: { type: String, required: true },
    images: [String], // additional images
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Product', promotionSchema);

export default Promotion;
