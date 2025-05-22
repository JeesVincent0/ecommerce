import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hashPassword: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300
  },
  referralUrl: { type: String, default: null}
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema)

export default PendingUser