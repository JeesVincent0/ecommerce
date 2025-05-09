import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs"

import User from '../models/userSchema.js'
import PendingUser from '../models/userTemp.js'
import Address from '../models/addressSchema.js'
import Order from '../models/ordersSchema.js'
import { sendOtp } from '../utils/sendOtp.js'
import { createToken } from './JWT.js'

import Product from "../models/productSchema.js"
import Category from "../models/categorySchema.js"
import mongoose from 'mongoose'
import { generateOtp } from '../utils/generateOtp.js'
import Cart from '../models/cartSchema.js'
import { generateOrderId } from '../utils/generateOrderId.js'
import generateInvoice from '../utils/generateInvoice.js'
import Wallet from '../models/walletSchema.js';

//@desc get page not found
//GET /notfound
export const notfound = (req, res) => {
    res.status(401).render('notfound')
}

//@desc get user signup page
// GET /signup
export const signUpPage = (req, res) => {
    res.render('user/signUp')
}

//@desc create new user
// POST /signup
export const createNewUser = async (req, res) => {
    try {

        //Getting user details from req.body
        const { name, email, password } = req.body

        //checking the email already taken or not
        const checkemail = await User.findOne({ email: email })
        if (checkemail) throw new Error("The email is already taken")

        //Generating hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        //generating otp for email varification
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

        // Remove old pending if any
        const removing = await PendingUser.deleteOne({ email })

        //save the login details in a tepm collection
        const saveDetails = await PendingUser.create({ name, email, hashPassword, otp, otpExpiresAt })

        //this otp send to the user email that get from user
        const emailSend = await sendOtp(email, otp)
        if (!emailSend) throw new Error("otp email not send")

        //redirecting to get otp validation page
        res.json({ success: true, redirectUrl: '/signup/otp' })

    } catch (error) {
        if (error.message === 'The email is already taken') {
            res.status(409).json({ success: false, message: 'The email is already taken' })
        } else if (error.message === 'otp email not send') {
            res.status(500).json({ status: false, message: 'otp email not send' })
        }

    }
}

//@desc get otp page
//GET /signup/otp
export const otpPage = (req, res) => {
    res.render('user/signupOtp')
}

//@desc verify otp and save new user detailes in user collection
//POST /signup/otp
export const verifyOtp = async (req, res) => {
    try {

        const otp = req.body.otp
        const tempUser = await PendingUser.findOne({ otp })
        if (!tempUser) throw new Error("Wrong OTP entered")

        const newUser = new User({
            name: tempUser.name,
            email: tempUser.email,
            hashPassword: tempUser.hashPassword
        })

        await newUser.save()

        const deletePending = await PendingUser.findOneAndDelete({ email: tempUser.email })


        res.json({ success: true, redirectUrl: '/home' })

    } catch (error) {

        if (error.message === 'Wrong OTP entered') {
            res.json({ success: false, message: 'Wrong OTP entered' })
        }
    }
}

//@desc this router is for after google login it create JWT
export const googleCallback = (req, res) => {

    //creaing token and redirecting to /home for render home page
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.cookie('jwt', token, { httpOnly: true });
    res.redirect('/home')
}

//@desc render login page
//GET /login
export const getLogin = (req, res) => {
    res.render('user/login')
}

//@desc verify user login
//POST /login
export const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        //find user from DB
        const user = await User.findOne({ email: email })

        //checking user entered email is correct or wrong
        if (!user) throw new Error("wrong email")
        if (!user.isActive) throw new Error("user blocked")
        if (user.isAdmin) throw new Error("wrong email")

        //user password checkin
        const pass = await bcrypt.compare(password, user.hashPassword)
        if (!pass) throw new Error("wrong password")

        //creating JWT token
        const token = createToken(user.email, '1h')

        res.cookie("jwt", token, { httpOnly: true })
        //if credentials are ok, then redirected to the home page
        res.json({ success: true, redirectUrl: '/home' })


    } catch (error) {
        if (error.message === 'wrong email') {
            return res.status(401).json({ email: false, pass: true });
        } else if (error.message === 'wrong password') {
            return res.status(401).json({ pass: false, email: true });
        } else if (error.message === 'user blocked') {
            return res.status(400).json({ success: false, message: 'user blocked', block: true, pass: true, email: true });
        } else {
            return res.status(500).json({ success: false, message: "Something went wrong" })
        }
    }
}

//@desc get forgotten password page
//GET /forgottonpassword
export const forgottonPassword = (req, res) => {
    res.render('user/forgot')
}

//@desc check email
//POST /forgottonpassword/checkemail
export const checkmail = async (req, res) => {
    try {

        //getting email to a variable
        const email = req.body.email

        //checking email
        const user = await User.findOne({ email })
        //if email is not found throw an error
        if (!user) throw new Error("wrong email")
        if (user.isAdmin) throw new Error("wrong email")

        //generating otp for email varification
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Remove old pending if any
        const removing = await PendingUser.deleteOne({ email })

        //save the login details in a tepm collection
        const saveDetails = await PendingUser.create({ email, otp })

        //this otp send to the user email that get from user
        const emailSend = await sendOtp(email, otp)
        if (!emailSend) throw new Error("otp email not send")

        res.json({ success: true })

    } catch (error) {
        if (error.message === 'wrong email') {
            res.status(401).json({ success: false, email: false })
        }
    }
}

//@desc checking otp
//POST /forgottonpassword/checkotp
export const checkotp = async (req, res) => {
    try {

        //getiing data from front end
        const { email, otp } = req.body

        //finding pending user and OTP validation
        const user = await PendingUser.findOne({ otp })

        //OTP not matching it will throw an error
        if (!user) throw new Error("Wrong OTP entered")

        //finding user original DB document for set JWT
        const orinalUser = await User.findOne({ email })

        //creating JWT token
        const token = createToken(user.email, '5m')

        //sending token to browser cookie
        res.cookie('jwt', token, { httpOnly: true })
        res.json({ success: true, redirectUrl: '/createpassword' })

    } catch (error) {
        if (error.message === 'Wrong OTP entered') {
            res.status(401).json({ success: false })
        }
    }
}

//@desc get new password page
//GET /createpassword
export const getCreatePassword = (req, res) => {
    try {

        //checking the user details through token
        const token = req.cookies?.jwt
        if (!token) res.redirect('/notfound')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //throw new error if the user details get from browser wrong
        if (!decoded) throw new Error("something went wrong")
        res.render('user/newpassword')

    } catch (error) {
        if (error.message === 'something went wrong') {
            res.status(401).json({ success: false, message: "Session expired please try again!" })
        }
    }

}

//@desc creating new password
//POST /createpassword
export const createNewPassword = async (req, res) => {
    try {

        //getting password and JWT Token
        const password = req.body.password
        const token = req.cookies.jwt

        //Retriving data from JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded?.userEmail) throw new Error("Session expired")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const changingPass = await User.updateOne({ _id: decoded.userId }, { $set: { hashPassword: hash } })
        res.status(200).json({ success: true, redirectUrl: '/home' })

    } catch (error) {
        if (error.message === "Session expired") {
            return res.status(401).json({ success: false, message: error.message })
        }
    }
}


//this conteroller for reset the jwt
export const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    })

    res.redirect("/adminLogin")
}

//@desc filter all product and send to product listing page
//GET /product
export const getProducts = async (req, res) => {
    try {
        const { key, price, name, category, minPrice, maxPrice } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const matchStage = {
            isActive: true // Product must be active
        };

        // If search key provided
        if (key) {
            matchStage.$text = { $search: key };
        }

        // Price filtering
        if (minPrice || maxPrice) {
            matchStage.last_price = {};
            if (minPrice) matchStage.last_price.$gte = Number(minPrice);
            if (maxPrice) matchStage.last_price.$lte = Number(maxPrice);
        }

        // Sorting
        const sortStage = {};
        if (price === '1') sortStage.last_price = 1;
        else if (price === '2') sortStage.last_price = -1;

        if (name === '1') sortStage.product_name = 1;
        else if (name === '2') sortStage.product_name = -1;

        if (key && Object.keys(sortStage).length === 0) {
            sortStage.score = { $meta: "textScore" };
        }

        // Aggregation pipeline
        const pipeline = [
            { $match: matchStage },

            // Join with Category collection
            {
                $lookup: {
                    from: 'categories', // collection name in MongoDB (usually lowercase plural)
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },

            // Filter products whose category is active
            {
                $match: {
                    'category.status': 'active'
                    // Optionally, also check: 'category.isChild': true
                }
            },
        ];

        if (key) {
            pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
        }

        pipeline.push(
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit }
        );

        const products = await Product.aggregate(pipeline);

        // Count for pagination (repeat logic with $count)
        const countPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            { $match: { 'category.status': 'active' } },
            { $count: 'total' }
        ];

        const countResult = await Product.aggregate(countPipeline);
        const totalCount = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.json({ products, totalPages, page });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc render the main product list page
//GET /productlist
export const listProducts = async (req, res) => {

    const key = req.query.key
    const categories = await Category.find()
    res.render("user/productList", { categories, key })
}

//@desc get a specific product full datails and related product listing
//GET /product/view/:id
export const productDetail = async (req, res) => {
    const productId = req.params.id

    const product = await Product.findOne({ _id: productId })
    const relatedProducts = await Product.find({ category_id: product.category_id }).limit(8)

    res.render("user/productDetails", { product, relatedProducts })
}

//@desc render home page
//GET /home
export const getHome = async (req, res) => {
    try {

        const clothes = await Product.find({ category_id: "6810cb9ff606c8964af4ee71" })
        res.render("user/home")
    } catch (error) {

    }
}

// @desc for user logout, clear jwt
//POST /userlogout
export const userLogout = (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        res.render("user/login")
    } catch (error) {
        res.status(500).json({ message: "something went wrong" })
    }
}

//@desc render user profile details page
// GET /profile
export const renderProfile = async (req, res) => {
    try {

        //Rendering user profile section
        res.render("user/profile")

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Someting went wrong", err: error.message })
    }
}

//@desc get user details for my profile section
//GET /myprofile
export const getProfile = async (req, res) => {
    try {

        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const email = decoded.userEmail;

        const user = await User.findOne({ email }).populate('addresses');
        res.json({ success: true, user: user })

    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}

//@desc send otp to email for change password from profile section
// GET /sendotp
export const otpSend = async (req, res) => {
    try {

        //verifying jwt for get email for otp send
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const otp = generateOtp();
        const email = decoded.userEmail;

        const sendotp = await sendOtp(email, otp)
        if (sendotp) {
            const remove = await PendingUser.deleteOne({ email })
            const create = await PendingUser.create({ email, otp })
            res.json({ success: true, message: "Otp sended successfully" });
        }
    } catch (error) {
        console.log(error.toString())
        res.json({ success: true, message: "Something went wrong" })
    }
}

//@desc verify otp 
// POST /otpVerify
export const otpVerify = async (req, res) => {
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
        console.log(error.toString())
    }
}

//@desc change password from profile section
//PATCH /changepassword
export const passwordChange = async (req, res) => {
    try {
        const password = req.body.newPassword

        const token = req.cookies.jwt

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded?.userEmail) throw new Error("Session expired")
        const email = decoded.userEmail;

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const changingPass = await User.updateOne({ email }, { $set: { hashPassword: hash } })
        res.json({ success: true })

    } catch (error) {
        console.log(error.toString())
        res.json({ success: false, message: 'Something went wrong' })
    }
}

//@desc save changes for my profile
//PATCH /edit-profile
export const editProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const imageBuffer = req.file?.buffer;
        const contentType = req.file?.mimetype;

        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const email1 = decoded.userEmail;

        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;

        if (req.file) {
            updateData.profileImage = {
                data: imageBuffer,
                contentType,
            };
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: email1 },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log(error.toString());
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

//@desc get profile image
//GET /user/:email/profile-pic
export const getProfilePic = async (req, res) => {
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
        console.log(error.message)
        res.json({ success: false, message: "Something went wrong" })
    }
}

//@desc get specific address
// GET /getaddress/:id
export const getAddress = async (req, res) => {
    try {
        const id = req.params.id
        const address = await Address.findById(id)
        res.json({ success: true, address })
    } catch (error) {
        console.log(error.toString())
        res.json({ success: false })
    }
}

//@desc update address
//POST /update-address/:id
export const updateAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const { housename, city, street, state, postalCode, label } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                housename,
                city,
                street,
                state,
                postalCode,
                label
            },
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        res.json({ success: true })
    } catch (error) {
        console.log(error.toString())
        res.json({ success: true })
    }
}

//@desc create new address
//POST /save-address/:id
export const createAddress = async (req, res) => {
    try {
        const userId = req.params.id;
        const { housename, city, street, state, postalCode, label } = req.body;

        // Create new address document
        const newAddress = new Address({
            userId,
            housename,
            street,
            city,
            state,
            postalCode,
            label
        });

        const savedAddress = await newAddress.save();

        // Push the address ID into user's addresses array
        await User.findByIdAndUpdate(userId, {
            $push: { addresses: savedAddress._id }
        });

        res.json({ success: true })
    } catch (error) {
        console.log(error.toString())
        res.json({ success: false })
    }
}

//@desc render cart page
//GET /cart
export const renderCart = (req, res) => {
    try {
        res.render("user/cart")
    } catch (error) {
        console.log(error.toString())
        res.json({ success: false })
    }
}

//@desc add new product to cart
//POST /add-to-cart/:id
export const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;

        const user = await User.findOne({ email });
        const product = await Product.findById(productId);
        
        // Check if product exists
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // ✅ Prevent adding to cart if stock is 0
        if (product.stock <= 0) {
            return res.status(400).json({ success: false, message: "Product out of stock" });
        }

        const userId = user._id;
        const price = product.last_price;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    quantity: 1,
                    priceAtTime: price
                }]
            });
        } else {
            const existingItem = cart.items.find(item => item.productId.equals(productId));

            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.priceAtTime = price;
            } else {
                cart.items.push({
                    productId,
                    quantity: 1,
                    priceAtTime: price
                });
            }
        }

        cart.updatedAt = new Date();
        await cart.save();

        res.json({ success: true });

    } catch (error) {
        console.log(error.toString());
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};


//@desc get cart details 
//GET /get-cart
export const getCartDetails = async (req, res) => {
    try {

        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;
        const userId = await User.findOne({ email }).select("_id")

        const cart = await Cart.findOne({ userId: userId._id }).populate('items.productId')


        res.json({ success: true, cart })
    } catch (error) {
        console.log(error.toString())
        res.json({ success: false })
    }
}

// @desc Decrement item quantity in cart
// @route POST /decrement-cart/:id
export const decreamentItem = async (req, res) => {
    try {
        const productId = req.params.id;
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;

        const user = await User.findOne({ email }).select('_id');
        const cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.find(i => i.productId.equals(productId));

        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                await cart.save();
                return res.json({ success: true });
            } else {
                return res.json({ success: false, message: 'Minimum quantity reached' });
            }
        }

        return res.status(404).json({ success: false, message: 'Product not in cart' });

    } catch (error) {
        console.error(error.toString());
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// @desc Delete cart item
// @route DELETE /delete-item/:id
export const deleteItem = async (req, res) => {
    try {
        const productId = req.params.id;
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;

        const user = await User.findOne({ email }).select('_id');
        const cart = await Cart.findOne({ userId: user._id });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Filter out the item to delete
        cart.items = cart.items.filter(item => !item.productId.equals(productId));

        await cart.save();

        return res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.log(error.toString());
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//@desc checkout from cart
//GET /checkout
export const checkOut = async (req, res) => {
    try {

        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;

        const user = await User.findOne({ email }).select('_id');

        const address = await Address.find({ userId: user })
        res.json({ success: true, address })

    } catch (error) {
        console.log(error.toString())
        res.status(500).json({ success: false })
    }
}

//@desc create new order
//POST /select-address
export const createOrder = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;

        const user = await User.findOne({ email });
        const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Use selected addressId from frontend
        const { addressId } = req.body;

        const shippingAddress = await Address.findOne({ _id: addressId, userId: user._id });
        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: 'Shipping address not found' });
        }

        // Calculate total
        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (item.priceAtTime * item.quantity);
        }, 0);

        const newOrder = new Order({
            userId: user._id,
            userName: user.name,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtTime
            })),
            shippingAddress: {
                housename: shippingAddress.housename,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode,
                label: shippingAddress.label,
                phone: user.phone
            },
            totalAmount,
            orderStatus: 'processing'
        });

        await newOrder.save();

        // Clear the cart
        await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });

        res.status(200).json({ success: true, orderId: newOrder._id, message: 'Order placed successfully' });
    } catch (error) {
        console.log(error.toString())
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

//@desc select payment method
//POST /place-order
export const paymentMethods = async (req, res) => {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
        return res.status(400).json({ success: false, message: "Missing order ID or payment method." });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        const orderId1 = generateOrderId()

        // Update payment method
        order.paymentMethod = paymentMethod;
        order.orderPlaced = true;
        order.orderId = orderId1;
        order.orderStatus = 'placed'

        await order.save();

        await Order.deleteMany({
            $or: [
              { orderPlaced: false },
              { orderPlaced: { $exists: false } }
            ]
          });          

        res.json({ success: true });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

//@desc render orders page
//GET /orders
export const ordersPage = async (req, res) => {
    try {
        res.render("user/orders")
    } catch (error) {
        console.log(error.toString())
        res.status(500).json({ success: false, message: "Something went wrong"})
    }
}

//@desc get all orders
//GET /get-orders
export const getOrders = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.userEmail;
        const user = await User.findOne({ email }).select("_id");

        const orders = await Order.find({ userId: user._id })
            .populate({ path: "items.productId" })              // Populate products
            .populate({ path: "userId", select: "name email" }); // Populate user

        res.json({ success: true, orders });
    } catch (error) {
        console.log("Populate error:", error.toString());
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};



//@desc get all orders
//GET /get-orders-admin
export const getOrdersAdmin = async (req, res) => {
    try {

        // Populate product data inside order items
        const orders = await Order.find()
            .populate("items.productId"); // assuming your schema has items.productId as a ref to Product

        res.json({ success: true, orders });
    } catch (error) {
        console.log(error.toString());
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//@desc cancell order
// PUT /orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Optional: prevent cancelling delivered or already cancelled orders
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    console.error(err.toString());
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Return reason is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({ success: false, message: "Only delivered orders can be returned" });
    }

    order.returnRequest = true;
    order.returnReason = reason;

    await order.save();

    res.status(200).json({ success: true, message: "Return request saved successfully" });
  } catch (err) {
    console.error("Error in returnOrder:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const invoicePath = path.join(__dirname, '..', 'invoices', `${order._id}.pdf`);

    // Check if invoice already exists, otherwise generate
    if (!fs.existsSync(invoicePath)) {
      generateInvoice(order, invoicePath);
    }

    // Wait a little for file to be ready
    setTimeout(() => {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${order._id}.pdf`
      });
      res.sendFile(invoicePath);
    }, 500);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWallet = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};