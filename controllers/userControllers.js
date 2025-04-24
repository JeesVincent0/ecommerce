import bcrypt, { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/userSchema.js'
import PendingUser from '../models/userTemp.js'
import { sendOtp } from '../utils/sendOtp.js'

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
        if(checkemail) throw new Error("The email is already taken")

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
        if(!emailSend) throw new Error("otp email not send")

        //redirecting to get otp validation page
        res.json({ success: true, redirectUrl: '/signup/otp'})

    } catch (error) {
        if(error.message === 'The email is already taken') {
            res.status(409).json({ success: false, message: 'The email is already taken'})
        } else if(error.message === 'otp email not send') {
            res.status(500).json({ status: false, message: 'otp email not send'})
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
        if(!tempUser) throw new Error("Wrong OTP entered")

        

        res.json({ success: true, redirectUrl: '/home'})

    } catch (error) {

        if(error.message === 'Wrong OTP entered') {
            res.json({success: false, message: 'Wrong OTP entered'})
        }
    }
}

//@desc this router is for after google login it create JWT
export const googleCallback = (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.cookie('jwt', token, { httpOnly: true});
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
        const user = await User.findOne({ email })
        console.log('email', !user)

        //checking user entered email is correct or wrong
        if(!user) throw new Error("wrong email")
        
        //user password checkin
        const pass = await bcrypt.compare(password, user.hashPassword)
        if(!pass) throw new Error("wrong password")

        //creating jwt and sending
        const payload = {
            userId: user._id,
            userEmail: user.email
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.cookie("jwt", token, { httpOnly: true })
        //if credentials are ok, then redirected to the home page
        res.json({ success: true,  redirectUrl: '/home' })
        

    } catch (error) {
        if (error.message === 'wrong email') {
            return res.status(401).json({ email: false , pass: true });
          } else if (error.message === 'wrong password') {
            return res.status(401).json({ pass: false ,email: true});
          } else {
            return res.status(500).json({ success: false, message: 'Unknown error' });
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
        if(!user) throw new Error("wrong email")

        //generating otp for email varification
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

        // Remove old pending if any
        const removing = await PendingUser.deleteOne({ email })

        //save the login details in a tepm collection
        const saveDetails = await PendingUser.create({ email, otp, otpExpiresAt })

        //this otp send to the user email that get from user
        const emailSend = await sendOtp(email, otp)
        if(!emailSend) throw new Error("otp email not send")

        console.log('mail sended')

        res.json({ success: true})
        
    } catch (error) {
        if(error.message === 'wrong email'){
            res.status(401).json({ success: false, email: false})
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
        if(!user) throw new Error("Wrong OTP entered")
        
        //finding user original DB document for set JWT
        const orinalUser = await User.findOne({ email })
        console.log("checkotp", orinalUser)

        //creating payload and token
        const payLoad = {
            userId: orinalUser._id,
            userEmail: user.email
        }
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: '5m'})

        //sending token to browser cookie
        res.cookie( 'jwt', token, { httpOnly: true })
        res.json({ success: true, redirectUrl: '/createpassword'})

    } catch (error) {
        if(error.message === 'Wrong OTP entered') {
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
        if(!token) res.redirect('/notfound')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //throw new error if the user details get from browser wrong
        if(!decoded) throw new Error("something went wrong")
        res.render('user/newpassword')

    } catch (error) {
        if(error.message === 'something went wrong') {
            res.status(401).json({ success: false, message: "Session expired please try again!"})
        }
    }
    
}

//@desc creating new password
//POST /createpassword
export const createNewPassword = async (req, res) => {
    try {

        //getting password and JWT Token
        const password = req.body.password
        console.log('password reached', password)
        const token = req.cookies.jwt
        console.log(token)

        //Retriving data from JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded?.userId) throw new Error("Session expired")

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        console.log("decodedUer", decoded.userId)
        console.log("decodedEmail", decoded.userEmail)

        const changingPass = await User.updateOne({ _id: decoded.userId }, { $set: { hashPassword: hash }})
        res.status(200).json({success: true, redirectUrl: '/home'})

    } catch (error) {
        if(error.message === "Session expired") {
            return res.status(401).json({ success: false, message: error.message})
        }
    }
}

export const logout = (req, res) => {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    res.status(200).json({ success: true, message: 'Logged out successfully' })
  }
  