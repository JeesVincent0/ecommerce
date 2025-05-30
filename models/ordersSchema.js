import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  refund: { type: String, enum: ["approve", "reject"], require: false },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  productPrice: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  returnRequest: { type: Boolean, default: false },
  returnReason: { type: String },
  orderStatus: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'failed'], default: 'failed' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  items: [orderItemSchema],
  shippingAddress: {
    housename: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    label: { type: String },
    phone: { type: String }
  },
  coupon: { code: { type: String }, discountAmount: { type: Number, default: 0 } },
  totalAmount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'online', 'razorpay', 'N/A'], required: false, default: "N/A" },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  placedAt: { type: Date, default: Date.now },
  orderPlaced: { type: Boolean, default: false },
  orderId: { type: String, unique: true },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;