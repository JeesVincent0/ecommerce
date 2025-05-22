import mongoose from 'mongoose';

const referralCouponSchema = new mongoose.Schema({
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
    default: 0
  },
  totalUsageLimit: {
    type: Number,
    required: true
  },
  usedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  offerDays: {
    type: Number,
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
  applicableUsers: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedDate: { type: Date }
  }
]

},
  {
    timestamps: true
  });

const referralCoupon = mongoose.model('referralCoupon', referralCouponSchema);
export default referralCoupon;