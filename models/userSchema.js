import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashPassword: { type: String},
    googleId: String,
    isActive: { type: Boolean, default: true},
},  { timestamps: true})

const User = mongoose.model('User', userSchema)
export default User