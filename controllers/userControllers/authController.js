import bcrypt from 'bcrypt';
import process from 'process';
import jwt from 'jsonwebtoken';
import { createToken } from '.././JWT.js';
import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import { sendOtp } from '../../utils/sendOtp.js';
import PendingUser from '../../models/userTemp.js';
import referralCoupon from "../../models/referralCouponSchema.js";

const authController = {

    //@desc render login page
    //GET /login
    getLogin: (req, res) => {
        try {
            res.render('user/login');
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    //@desc verify user login
    //POST /login
    verifyLogin: async (req, res) => {
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
            logger.error(error.toString());
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
    },

    //@desc get user signup page
    // GET /signup
    signUpPage: (req, res) => {
        try {
            const referralUrl = req.query.ref;
            res.render('user/signUp', { referralUrl })
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ message: "Something went wrong" })
        }
    },

    //@desc create new user
    // POST /signup
    createNewUser: async (req, res) => {
        try {

            //Getting user details from req.body
            const { name, email, password, referralUrl } = req.body

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
            await PendingUser.deleteOne({ email })

            //save the login details in a tepm collection
            await PendingUser.create({ name, email, hashPassword, otp, otpExpiresAt, referralUrl })

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
    },

    //@desc get otp page
    //GET /signup/otp
    otpPage: (req, res) => {
        try {
            res.render('user/signupOtp');
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    //@desc verify otp and save new user detailes in user collection
    //router POST /signup/otp
    verifyOtp: async (req, res) => {
        try {
            const otp = req.body.otp
            const tempUser = await PendingUser.findOne({ otp })
            if (!tempUser) throw new Error("Wrong OTP entered")

            const newUser = new User({
                name: tempUser.name,
                email: tempUser.email,
                hashPassword: tempUser.hashPassword
            })

            const userSaved = await newUser.save()

            const referalCode1 = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
            const referralUrl = process.env.NODE_ENV === 'production'
                ? 'https://shoppi.fun/auth/google/callback'
                : 'http://localhost:8000/auth/google/callback' + referalCode
            await User.findOneAndUpdate({ _id: userSaved._id }, { $set: { referralUrl, referalCode: referalCode1 } }, { new: true })

            const availableCoupons = await referralCoupon.aggregate([{ $match: { status: 'active', totalUsageLimit: { $gt: 0 } } }, { $sample: { size: 1 } }]);
            const referalCode = tempUser.referralUrl;
            const user = await User.findOne({ referalCode })

            if (user) {
                const coupon = availableCoupons[0];

                const startDate = new Date();
                const expiryDate = new Date();
                expiryDate.setDate(startDate.getDate() + coupon.offerDays);

                const existingCoupon = await referralCoupon.findOne({
                    _id: coupon._id,
                    "applicableUsers.userId": user._id
                });

                if (existingCoupon) {

                    await referralCoupon.updateOne({ _id: coupon._id, "applicableUsers.userId": user._id }, { $inc: { "applicableUsers.$.limit": 1, totalUsageLimit: -1 } });

                } else {

                    await referralCoupon.updateOne({ _id: coupon._id }, { $push: { applicableUsers: { userId: user._id, startedDate: startDate, expiryDate, limit: 1 } }, $inc: { totalUsageLimit: -1 } });

                }
            } else {
                res.json({ success: true, redirectUrl: '/referralcode' })
            }

            await PendingUser.findOneAndDelete({ email: tempUser.email })

            res.json({ success: true, redirectUrl: '/home' })

        } catch (error) {

            logger.error(error.toString())
            logger.error(error)

            if (error.message === 'Wrong OTP entered') {
                res.json({ success: false, message: 'Wrong OTP entered' })
            }
        }
    },

    //@ desc this conteroller for reset the jwt
    logout: (req, res) => {
        try {
            res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'strict' })
            res.redirect("/adminLogin")
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    //@desc get forgotten password page
    //GET /forgottonpassword
    forgottonPassword: (req, res) => {
        try {
            res.render('user/forgot')
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    //@desc check email
    //POST /forgottonpassword/checkemail
    checkmail: async (req, res) => {
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
            await PendingUser.deleteOne({ email })

            //save the login details in a tepm collection
            await PendingUser.create({ email, otp })

            //this otp send to the user email that get from user
            const emailSend = await sendOtp(email, otp)
            if (!emailSend) throw new Error("otp email not send")

            res.json({ success: true })

        } catch (error) {
            logger.error(error.toString());
            if (error.message === 'wrong email') {
                res.status(401).json({ success: false, email: false })
            } else {
                res.status(500).json({ message: "Something went wrong" });
            }
        }
    },

    //@desc checking otp
    //POST /forgottonpassword/checkotp
    checkotp: async (req, res) => {
        try {

            //getiing data from front end
            const { email, otp } = req.body

            //finding pending user and OTP validation
            const user = await PendingUser.findOne({ otp })

            //OTP not matching it will throw an error
            if (!user) throw new Error("Wrong OTP entered")

            //finding user original DB document for set JWT
            await User.findOne({ email })

            //creating JWT token
            const token = createToken(user.email, '5m')

            //sending token to browser cookie
            res.cookie('jwt', token, { httpOnly: true })
            res.json({ success: true, redirectUrl: '/createpassword' })

        } catch (error) {
            logger.error(error);
            if (error.message === 'Wrong OTP entered') {
                res.status(401).json({ success: false })
            } else {
                res.status(500).json({ message: "Something went wrong" });
            }
        }
    },

    //@desc get new password page
    //GET /createpassword
    getCreatePassword: (req, res) => {
        try {

            //checking the user details through token
            const token = req.cookies?.jwt
            if (!token) res.redirect('/notfound')
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //throw new error if the user details get from browser wrong
            if (!decoded) throw new Error("something went wrong")
            res.render('user/newpassword')

        } catch (error) {
            logger.error(error)
            if (error.message === 'something went wrong') {
                res.status(401).json({ success: false, message: "Session expired please try again!" })
            } else {
                res.status(500).json({ message: "Something went wrong" });
            }
        }
    },

    //@desc creating new password
    //POST /createpassword
    createNewPassword: async (req, res) => {
        try {
            //getting password and JWT Token
            const password = req.body.password
            const token = req.cookies.jwt

            //Retriving data from JWT Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (!decoded?.userEmail) throw new Error("Session expired")

            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            const changingPass = await User.updateOne({ email: decoded.userEmail }, { $set: { hashPassword: hash } })

            if (changingPass) {
                res.status(200).json({ success: true, redirectUrl: '/home' })
            }

        } catch (error) {
            logger.error(error);
            if (error.message === "Session expired") {
                return res.status(401).json({ success: false, message: error.message })
            } else {
                res.status(500).json({ message: "Something went wrong" });
            }
        }
    },

    // @desc for user logout, clear jwt
    //POST /userlogout
    userLogout: (req, res) => {
        try {

            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.render("user/login")
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ message: "something went wrong" })
        }
    },

    //@desc this router is for after google login it create JWT
    googleCallback: (req, res) => {

        try {
            //creaing token and redirecting to /home for render home page
            const token = jwt.sign({ userEmail: req.user.email }, process.env.JWT_SECRET, { expiresIn: '10m' });
            res.cookie('jwt', token, { httpOnly: true });
            res.redirect('/home')
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },
}

export default authController;