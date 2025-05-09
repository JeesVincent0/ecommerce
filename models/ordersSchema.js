import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true},
  items: [orderItemSchema],
  shippingAddress: {
    housename: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    label: { type: String },
    phone: { type: String}
  },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'online'], required: false },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed','processing', 'shipped', 'delivered', 'cancelled','returned'], default: 'processing' },
  placedAt: { type: Date, default: Date.now },
  orderPlaced: { type: Boolean , default: false},
  orderId: { type: String, unique: true},
  returnRequest: { type: Boolean, default: false}
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
