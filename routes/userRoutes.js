//importing third-prty modules
import multer from 'multer';
import express from 'express';
import passport from 'passport';

//importing controllers
import cartController from '../controllers/userControllers/cartContoller.js';
import homeController from '../controllers/userControllers/homeController.js';
import authController from '../controllers/userControllers/authController.js';
import userOrderController from '../controllers/userControllers/userOrders.js';
import couponController from '../controllers/userControllers/couponController.js';
import paymentController from '../controllers/userControllers/paymentController.js';
import profileController from '../controllers/userControllers/profileController.js';
import wishListController from '../controllers/userControllers/wishListController.js';
import notfoundController from '../controllers/userControllers/notfoundController.js';
import productListController from '../controllers/userControllers/productListController.js';

//importing middleware
import { redirectIfAuthenticated, verifyUserJWT } from '../middleware/routerMiddleware.js'

//setting router to a variable
const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage });

//get page not found
router.get('/notfound', notfoundController.notfound)

//get user home page
router.get("/home", verifyUserJWT, homeController.getHome);



//@desc Router for wishlist
//render wishlist 
router.get("/wishlist", wishListController.renderWishlist);

//add product to wishlist 
router.post('/wishlist/add', wishListController.addToWishlist);

//remove wishlist product
router.delete("/wishlist/remove", wishListController.removeFromWishlist);



//verify coupon
router.post("/checkcoupon", couponController.verifyCoupon);

//render referral code page after succefull account creation
router.get("/referralcode", couponController.renderReferralPage);

//check manualy entered referral code agter successfull signup
router.post("/referralcode", couponController.checkReferralCode);



//@desc router for authentication controllers
//Get login page
router.get('/login', redirectIfAuthenticated, authController.getLogin);

//verify user login
router.post('/login', authController.verifyLogin);

//Get signup page
router.get('/signup', authController.signUpPage);

//create new user
router.post('/signup', authController.createNewUser);

//get otp verification page for new user
router.get('/signup/otp', authController.otpPage);

//verify otp
router.post('/signup/otp', authController.verifyOtp)

//user logout
router.get("/userlogout", authController.userLogout)

//logout
router.get('/logout', authController.logout)

//get forgotten password page
router.get('/forgottonpassword', authController.forgottonPassword)

//for check the mail id
router.post('/forgottonpassword/checkemail', authController.checkmail)

//for check otp
router.post('/forgottonpassword/checkotp', authController.checkotp)

//get create new password page
router.get("/createpassword", verifyUserJWT, authController.getCreatePassword)

//create new password
router.post("/createpassword", authController.createNewPassword)

//signUp with google setup
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/'}), authController.googleCallback);




//@desc Router for user Profile section
//get user profile
router.get("/profile", profileController.renderProfile);

//get user details for my profile options
router.get("/myprofile", profileController.getProfile);

//get profile pic
router.get('/user/:email/profile-pic', profileController.getProfilePic);

//verify opt from profile section
router.post("/otpVerify", profileController.otpVerify);

//form data after to change profile details
router.patch("/edit-profile", upload.single('profilePic'), profileController.editProfile);

//send otp to mail
router.get("/sendotp", profileController.otpSend);

//change password
router.patch("/changepassword", profileController.passwordChange);

//get sprcific address for edit
router.get("/getaddress/:id", profileController.getAddress);

//update address
router.post("/update-address/:id", profileController.updateAddress);

//create new address
router.post("/save-address/:id", profileController.createAddress);

//render wallet page show transaction
router.get("/get-wallet", profileController.getWallet);

//delete address
router.delete("/address/:id", profileController.deleteAddress);

//generate user referal url
router.get("/profile/referalurl", profileController.generateReferalUrl);



//@desc router for orders
//get order page
router.get("/orders", userOrderController.ordersPage);

//get all orders
router.get("/get-orders", userOrderController.getOrders)

//cancelling order items
router.put('/orders/:id/cancel', userOrderController.cancelOrder);

//return request
router.put("/orders/:id/return", userOrderController.returnOrder);

//checkout from cart
router.get("/checkout", userOrderController.checkOut);

//create order collection using cart details and address selcted
router.post("/select-address", userOrderController.createOrder);

//cancelling one item from a order
router.patch('/order/item/cancel', userOrderController.cancelOrderItemController);

// Route to download invoice
router.get('/orders/:id/invoice', userOrderController.getInvoice);

//order success page rendering
router.get("/order-success", userOrderController.renderSuccess);

//order failed page rendering
router.get("/order-failed", userOrderController.renderFailed);



//@desc Router for products
//this router is for render product list page
router.get("/productlist", productListController.listProducts);

//get products after filter
router.get('/product', productListController.getProducts);

//get spacific product details and related product
router.get("/product/view/:id", productListController.productDetail)



//@desc Router for cart section
//get cart page
router.get("/cart", cartController.renderCart);

//get cart details
router.get("/get-cart", cartController.getCartDetails);

//add product to cart
router.post("/add-to-cart/:id", cartController.addToCart);

//decreament items quantity
router.post("/decrement-cart/:id", cartController.decreamentItem);

//delete cart items
router.delete("/delete-item/:id", cartController.deleteItem);



//@desc Router for payment section
//select order payment method
router.post("/place-order", paymentController.paymentMethods);

//checking payment varification
router.post("/verify-payment", paymentController.verifyPayment);

export default router