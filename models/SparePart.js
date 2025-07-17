import mongoose from 'mongoose';

const SparePartSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
});

export default mongoose.model('SparePart', SparePartSchema);
