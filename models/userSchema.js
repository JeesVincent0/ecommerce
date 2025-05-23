import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashPassword: { type: String },
    googleId: String,
    phone: String,
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    profileImage: { data: Buffer, contentType: String, },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    referralUrl: { type: String, default: null },
    referalCode: { type: String, default: null },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
export default User