//importing third-prty modules
import express from 'express'
import passport from 'passport'

//importing local modules
import { checkmail, checkotp, createNewPassword, createNewUser, forgottonPassword, getCreatePassword, getLogin, googleCallback, logout, notfound, otpPage, signUpPage, verifyLogin, verifyOtp } from '../controllers/userControllers.js'
import { checkToken } from '../middleware/gobalMiddleware.js'

const router = express.Router()

//get page not found
router.get('/notfound', notfound)
//Get signup page
router.get('/signup', signUpPage)

//create new user
router.post('/signup', createNewUser)

//get otp verification page for new user
router.get('/signup/otp',otpPage)

//verify otp
router.post('/signup/otp', verifyOtp)

//Get login page
router.get('/login', getLogin)

//verify user login
router.post('/login', verifyLogin)

//logout
router.get('/logout', logout)

//get forgotten password page
router.get('/forgottonpassword', forgottonPassword)

//for check the mail id
router.post('/forgottonpassword/checkemail', checkmail)

//for check otp
router.post('/forgottonpassword/checkotp', checkotp)

//get create new password page
router.get("/createpassword", getCreatePassword)

//create new password
router.post("/createpassword", createNewPassword)

//signUp with google setup
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/'}), googleCallback)


export default router