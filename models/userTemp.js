import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hashPassword: String,
  otp: String,
  otpExpiresAt: Date,
}, { timestamps: true });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema)

export default PendingUser