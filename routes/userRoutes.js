//importing third-prty modules
import express from 'express'
import passport from 'passport'
import multer from 'multer'

//importing local modules
import { addToCart, cancelOrder, checkmail, checkotp, checkOut, createAddress, createNewPassword, createNewUser, createOrder, decreamentItem, deleteItem, editProfile, forgottonPassword, getAddress, getCartDetails, getCreatePassword,  getHome,  getInvoice,  getLogin, getOrders, getOrdersAdmin, getProducts, getProfile, getProfilePic, getWallet, googleCallback, listProducts, logout, notfound, ordersPage, otpPage, otpSend, otpVerify, passwordChange, paymentMethods, productDetail, renderCart, renderProfile, returnOrder, signUpPage, updateAddress, updateOrderStatus, userLogout, verifyLogin, verifyOtp } from '../controllers/userControllers.js'
import { redirectIfAuthenticated, verifyUserJWT } from '../middleware/routerMiddleware.js'

//setting router to a variable
const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

//get sprcific address for edit
router.get("/getaddress/:id", getAddress);

//update address
router.post("/update-address/:id", updateAddress);

//create new address
router.post("/save-address/:id", createAddress);

//change password
router.patch("/changepassword", passwordChange);

//form data after to change profile details
router.patch("/edit-profile", upload.single('profilePic'), editProfile);

//get profile pic
router.get('/user/:email/profile-pic', getProfilePic);

//get cart page
router.get("/cart", renderCart);

//add product to cart
router.post("/add-to-cart/:id", addToCart);

//get cart details
router.get("/get-cart", getCartDetails);

//decreament items quantity
router.post("/decrement-cart/:id", decreamentItem);

//delete cart items
router.delete("/delete-item/:id", deleteItem);

//checkout from cart
router.get("/checkout", checkOut);

//create order collection using cart details and address selcted
router.post("/select-address", createOrder);

//select order payment method
router.post("/place-order", paymentMethods);

//get order page
router.get("/orders", ordersPage);

//get all orders
router.get("/get-orders", getOrders)

//for admin list all orders
router.get("/get-orders-admin", getOrdersAdmin)

// PUT route to update order status
router.put('/orders/:id/status', updateOrderStatus);

//cancelling order
router.put('/orders/:id/cancel', cancelOrder);

//return request
router.put("/orders/:id/return", returnOrder);

// Route to download invoice
router.get('/orders/:id/invoice', getInvoice);

router.get("/get-wallet", getWallet);

  
//signUp with google setup
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/'}), googleCallback)


export default router