import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // Only used when discountType is 'percentage'
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  totalUsageLimit: {
    type: Number,
    default: null
  },
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      usageCount: { type: Number, default: 1 }
    }
  ],
  startDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicableUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
},
  {
    timestamps: true
  });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;