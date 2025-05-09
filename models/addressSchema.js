import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, enum: ['home', 'office'], default: 'home' },
  housename: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String },
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);
export default Address;