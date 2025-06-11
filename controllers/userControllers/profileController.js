import bcrypt from 'bcrypt';
import process from 'process';
import jwt from 'jsonwebtoken';
import { createToken } from '.././JWT.js';
import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import { sendOtp } from '../../utils/sendOtp.js';
import Wallet from '../../models/walletSchema.js';
import PendingUser from '../../models/userTemp.js';
import Address from '../../models/addressSchema.js';
import { generateOtp } from '../../utils/generateOtp.js';
import referralCoupon from "../../models/referralCouponSchema.js";

const profileController = {
    //@desc render user profile details page
    // GET /profile
    renderProfile: async (req, res) => {
        try {
            //Rendering user profile section
            res.render("user/profile")
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: "Someting went wrong", err: error.message })
        }
    },

    //@desc get user details for my profile section
    //GET /myprofile
    getProfile: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email }, { profileImage: 0 }).populate('addresses');
            const coupons = await referralCoupon.find({ applicableUsers: { $elemMatch: { userId: user._id, limit: { $gt: 0 } } } });
            res.json({ success: true, user, coupons });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    //@desc get profile image
    //GET /user/:email/profile-pic
    getProfilePic: async (req, res) => {
        try {
            const email = req.params.email
            const user = await User.findOne({ email });
            if (user?.profileImage?.data) {
                res.set('Content-Type', user.profileImage.contentType);
                res.send(user.profileImage.data);
            } else {
                res.status(404).send('No image');
            }
        } catch (error) {
            logger.error(error.message)
            res.json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc verify otp 
    //router POST /otpVerify
    otpVerify: async (req, res) => {
        try {
            const otp = req.body.otp

            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const email = decoded.userEmail;

            const pendingUser = await PendingUser.findOne({ email })
            if (pendingUser.otp === otp) {
                res.json({ success: true })
            } else {
                res.json({ success: false })
            }

        } catch (error) {
            logger.error(error);
            res.json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc save changes for my profile
    //router PATCH /edit-profile
    editProfile: async (req, res) => {
        try {
            const { name, email, phone, password } = req.body;
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const currentUserEmail = decoded.userEmail;

            // Find the current user
            const currentUser = await User.findOne({ email: currentUserEmail });
            if (!currentUser) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            // Check if email is being changed
            const isEmailChanging = email && email !== currentUserEmail;

            if (isEmailChanging) {
                if (!currentUser.hashPassword) {
                    return res.status(400).json({
                        success: false,
                        error: "Cannot change email for Google authenticated accounts without setting a password first"
                    });
                }

                if (!password) {
                    return res.status(400).json({
                        success: false,
                        error: "Password is required to change email address"
                    });
                }

                const isPasswordValid = await bcrypt.compare(password, currentUser.hashPassword);
                if (!isPasswordValid) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid password"
                    });
                }

                const existingUser = await User.findOne({ email: email });
                if (existingUser && existingUser._id.toString() !== currentUser._id.toString()) {
                    return res.status(400).json({
                        success: false,
                        error: "Email address is already in use"
                    });
                }
            }

            // Image validation
            if (req.file) {
                const validTypes = ['image/jpeg', 'image/jpg'];
                const maxSize = 2 * 1024 * 1024; // 2MB

                if (!validTypes.includes(req.file.mimetype)) {
                    return res.status(400).json({
                        success: false,
                        error: "Only JPEG images are allowed"
                    });
                }

                if (req.file.size > maxSize) {
                    return res.status(400).json({
                        success: false,
                        error: "Image size should be less than 2MB"
                    });
                }
            }

            // Build update data
            const updateData = {};
            if (name && name.trim()) updateData.name = name.trim();
            if (phone && phone.trim()) updateData.phone = phone.trim();
            if (email && email.trim()) updateData.email = email.trim();

            if (req.file) {
                updateData.profileImage = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                };
            }

            const updatedUser = await User.findOneAndUpdate(
                { email: currentUserEmail },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ success: false, error: "Failed to update user" });
            }

            if (isEmailChanging) {
                const newToken = createToken(email, '1h');
                res.cookie("jwt", newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }

            const { hashPassword, ...userWithoutPassword } = updatedUser.toObject();

            res.json({
                success: true,
                user: userWithoutPassword,
                message: isEmailChanging ? "Profile updated successfully. Please log in again if needed." : "Profile updated successfully"
            });

        } catch (error) {
            console.error("Edit Profile Error:", error);

            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    error: "Email address is already in use"
                });
            }

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    error: "Invalid data provided"
                });
            }

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: "Invalid authentication token"
                });
            }

            res.status(500).json({
                success: false,
                error: "Something went wrong. Please try again."
            });
        }
    },

    //@desc send otp to email for change password from profile section
    //router GET /sendotp
    otpSend: async (req, res) => {
        try {

            //verifying jwt for get email for otp send
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const otp = generateOtp();
            const email = decoded.userEmail;

            const sendotp = await sendOtp(email, otp)
            if (sendotp) {
                await PendingUser.deleteOne({ email })
                await PendingUser.create({ email, otp })
                res.json({ success: true, message: "Otp sended successfully" });
            }
        } catch (error) {
            logger.error(error)
            res.json({ success: true, message: "Something went wrong" })
        }
    },

    //@desc change password from profile section
    //PATCH /changepassword
    passwordChange: async (req, res) => {
        try {
            const otp = req.body.otp;
            const password = req.body.newPassword;

            const token = req.cookies.jwt;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.userEmail) throw new Error("Session expired");

            const email = decoded.userEmail;

            const pendingUser = await PendingUser.findOne({ email });
            if (!pendingUser || pendingUser.otp !== otp) {
                return res.json({ success: false, message: "Invalid OTP" });
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            await User.updateOne({ email }, { $set: { hashPassword: hash } });

            // remove pending user entry after successful password change
            await PendingUser.deleteOne({ email });

            res.json({ success: true, message: "Password updated successfully" });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: 'Something went wrong' });
        }
    },

    //@desc get specific address
    // GET /getaddress/:id
    getAddress: async (req, res) => {
        try {
            const id = req.params.id
            const address = await Address.findById(id)
            res.json({ success: true, address })
        } catch (error) {
            logger.error(error)
            res.json({ success: false });
        }
    },

    //@desc update address
    //POST /update-address/:id
    updateAddress: async (req, res) => {
        try {
            const addressId = req.params.id;
            const { housename, city, street, state, postalCode, label } = req.body;

            const updatedAddress = await Address.findByIdAndUpdate(addressId, { housename, city, street, state, postalCode, label }, { new: true, runValidators: true });

            if (!updatedAddress) {
                return res.status(404).json({ success: false, message: 'Address not found' });
            }

            res.json({ success: true })
        } catch (error) {
            logger.error(error.toString())
            res.json({ success: true })
        }
    },

    //@desc create new address
    //POST /save-address/:id
    createAddress: async (req, res) => {
        try {
            let userId = req.params.id;
            if (!userId) {
                const token = req.cookies.jwt;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const email = decoded.userEmail;
                const user = await User.findOne({ email });
                userId = user._id;
            }
            const { housename, city, street, state, postalCode, label } = req.body;

            // Create new address document
            const newAddress = new Address({ userId, housename, street, city, state, postalCode, label });

            const savedAddress = await newAddress.save();

            // Push the address ID into user's addresses array
            await User.findByIdAndUpdate(userId, {
                $push: { addresses: savedAddress._id }
            });

            res.json({ success: true, userId })
        } catch (error) {
            logger.error(error.toString())
            res.json({ success: false })
        }
    },

    //@desc get user wallet detailes
    //Router GET /get-wallet
    getWallet: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            if (!token) return res.status(401).json({ success: false, message: "No token provided" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.userEmail;

            const user = await User.findOne({ email: userEmail });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            const wallet = await Wallet.findOne({ userId: user._id });
            if (!wallet) {
                return res.json({
                    success: true,
                    wallet: { balance: 0, transactions: [] }
                });
            }

            res.json({ success: true, wallet });
        } catch (err) {
            logger.error(err);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    },

    //@desc delte address
    //DELETE /address/:id
    deleteAddress: async (req, res) => {
        try {
            const addressId = req.params.id
            const deleteAddress = await Address.deleteOne({ _id: addressId })
            if (!deleteAddress) throw new Error("Something wrong")
            res.json({ success: true })

        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc generate user sharable referal url
    // GET /profile/referalurl
    generateReferalUrl: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email });
            const userId = user._id;

            const referalCode = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
            const referralUrl = process.env.NODE_ENV === 'production'
                ? 'https://shoppi.fun/auth/google/callback'
                : 'http://localhost:8000/auth/google/callback' + referalCode;

            await User.findOneAndUpdate({ _id: userId }, { $set: { referralUrl, referalCode } }, { new: true })

            res.json({ success: true, referralUrl })

        } catch (error) {
            logger.error(error)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

}

export default profileController;