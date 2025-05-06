//importing third-prty modules
import express from 'express'
import passport from 'passport'

//importing local modules
import { checkmail, checkotp, createNewPassword, createNewUser, forgottonPassword, getCreatePassword,  getHome,  getLogin, getProducts, getProfile, googleCallback, listProducts, logout, notfound, otpPage, otpSend, otpVerify, passwordChange, productDetail, renderProfile, signUpPage, userLogout, verifyLogin, verifyOtp } from '../controllers/userControllers.js'
import { redirectIfAuthenticated, verifyUserJWT } from '../middleware/routerMiddleware.js'

//setting router to a variable
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
router.get('/login', redirectIfAuthenticated, getLogin)

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
router.get("/createpassword", verifyUserJWT, getCreatePassword)

//create new password
router.post("/createpassword", createNewPassword)

//get user home page
router.get("/home", verifyUserJWT, getHome);

//this router is for render product list page
router.get("/productlist", listProducts);

//get products after filter
router.get('/product', getProducts);

//get spacific product details and related product
router.get("/product/view/:id", productDetail)

//get user profile
router.get("/profile", renderProfile)

//user logout
router.get("/userlogout",userLogout)

//get user details for my profile options
router.get("/myprofile", getProfile)

//send otp to mail
router.get("/sendotp", otpSend);

//verify opt from profile section
router.post("/otpVerify", otpVerify);

//change password
router.patch("/changepassword", passwordChange);

//signUp with google setup
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/'}), googleCallback)


export default router