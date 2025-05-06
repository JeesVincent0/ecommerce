import bcrypt, { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/userSchema.js'
import PendingUser from '../models/userTemp.js'
import { sendOtp } from '../utils/sendOtp.js'
import { createToken } from './JWT.js'

import Product from "../models/productSchema.js"
import Category from "../models/categorySchema.js"
import mongoose from 'mongoose'
import { generateOtp } from '../utils/generateOtp.js'


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
        console.log(`${name}, ${email}, ${password}`)

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
        console.log('email', !user)

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
            return res.status(500).json({ success: false, message: "Something went wrong"})
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

        console.log('mail sended')

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
        console.log("checkotp", orinalUser)

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
        console.log("jwt created")

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

        const matchStage = {};

        // Category filtering
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category });
            if (categoryDoc) {
                matchStage.category_id = new mongoose.Types.ObjectId(categoryDoc._id);
            }
        }

        // Text search
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

        // If text search used and no custom sort, sort by text score
        if (key && Object.keys(sortStage).length === 0) {
            sortStage.score = { $meta: "textScore" };
        }

        // Aggregation pipeline
        const pipeline = [
            { $match: matchStage },
        ];

        // Project text score (if searching)
        if (key) {
            pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
        }

        pipeline.push(
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit }
        );

        // Execute pipeline
        const products = await Product.aggregate(pipeline);

        // Count total products for pagination
        const totalCount = await Product.countDocuments(matchStage);
        const totalPages = Math.ceil(totalCount / limit);

        // Response
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
    console.log("related", relatedProducts)

    res.render("user/productDetails", { product, relatedProducts })
}

//@desc render home page
//GET /home
export const getHome = async (req, res) => {
    try {

        const clothes = await Product.find({ category_id: "6810cb9ff606c8964af4ee71" })
        console.log(clothes)
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
        res.status(500).json({message: "something went wrong"})
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
        res.status(500).json({ message: "Someting went wrong", err: error.message})
    }
}

//@desc get user details for my profile section
//GET /myprofile
export const getProfile = async (req, res) => {
    try {

        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({ email: decoded.userEmail })
        res.json({ success: true, user: user})

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
        if(sendotp) {
            const remove = await PendingUser.deleteOne({email})
            const create = await PendingUser.create({email, otp})
            console.log("successfully otp sended")
            res.json({ success: true, message: "Otp sended successfully" });
        }
    } catch (error) {
        console.log(error.toString())
        res.json({ success: true, message: "Something went wrong"})
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
        if(pendingUser.otp === otp) {
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
        res.json({ success: false, message: 'Something went wrong'})
    }
}