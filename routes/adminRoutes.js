import express from 'express'
import orderController from '../controllers/adminControllers/orderController.js'
import { productImageUpload, redirectIfAuthenticatedAdmin, verifyAdminJWT } from '../middleware/routerMiddleware.js'


//importing controller file.
import userController from '../controllers/adminControllers/userController.js';
import authController from '../controllers/adminControllers/authController.js';
import couponController from '../controllers/adminControllers/couponController.js';
import productController from '../controllers/adminControllers/productController.js';
import categoryController from '../controllers/adminControllers/categoryController.js';
import dashBoardController from '../controllers/adminControllers/dashBoardController.js';
import salesReportController from '../controllers/adminControllers/salesReportController.js';
import refferalCouponController from '../controllers/adminControllers/refferalCouponController.js';

const router = express.Router()


//@desc Router for adimin section authentication.
//get admin login page
router.get('/adminlogin', redirectIfAuthenticatedAdmin, authController.getAdminLogin)

//verify admin
router.post("/adminlogin", authController.verifyAdminLogin)



//@desc Router for admin dashboard
//get admin home
router.get("/adminhome", verifyAdminJWT, dashBoardController.getAdminHome)

//get data for admin dashborde
router.get("/dashboard", dashBoardController.dashBoardData)

//get sales report for admin dashboard
router.get('/sales-chart-data', dashBoardController.getSalesChartData);



//@desc Router for admin section
//get admin users list
router.get('/users', userController.getUsers);

//bolck user
router.get("/users/block", userController.blockUser)

//unblock user
router.get("/users/unblock", userController.unBlockUser);

//get user using search keywords
router.get("/users/search", userController.getUsersSearch);

//Get user details in admin side
router.get('/user-details/:email', userController.getUserDetailsAndOrders);



//@desc Router for admin category section
//get cotegory list
router.get("/category", categoryController.getCategoryList);

//create new category
router.post("/category", categoryController.createNewCategory);

//get category data names and slug for selection
router.get("/category/miancategory/:parentId", categoryController.getCategoryNames);

//get category using search keywords
router.get("/category/search", categoryController.getCategorySearch)

//get data for edit category
router.get("/category/edit", categoryController.editCategoryForm);

//edit category
router.patch("/category/edit", categoryController.editCategory)

//block and unblock category
router.patch('/category/block/:slug', categoryController.statusCategory);

//block and unblock category
router.patch('/toggle-status/:id', categoryController.toggleCategoryStatus);



//@desc Router for admin product section
//get products list
router.get("/products", productController.getProducts);

//product search
router.get("/products/search", productController.getProductsSearch)

//get available category
router.get("/product/category", productController.getChildCategory)

//add new product
router.post("/product/add", productImageUpload, productController.addNewProduct);

//get brand for add or edit product form
router.get("/product/brands", productController.getBrands);

//get product data for edit form
router.get("/product/:id", productController.getProductData);

//edit product details
router.post('/product/edit', productImageUpload, productController.editProduct);

//product delete
router.delete("/product/delete/:id", productController.deleteProduct);

//Product status changing 
router.patch('/admin/products/:id/status', productController.toggleProductStatus);

// router.put('/orders/:orderId/status', updateOrderStatus)


//@desc Router for normal coupon section
//get all coupons
router.get("/coupon", couponController.getCoupons);

//add new coupen
router.post("/coupon/add", productImageUpload, couponController.addCoupon);

//get coupon data for edit coupon
router.get("/coupon/edit", couponController.getCoupon);

//save edited coupon data
router.patch("/coupon/edit", productImageUpload, couponController.saveCoupon);

//block and unblock coupen
router.patch("/coupon/block", couponController.blockCoupon);

//search coupon;
router.get('/coupon/search', couponController.searchCoupons);



//@desc Router for rerral coupons
//get Referral coupons
router.get("/coupon/referral", refferalCouponController.getReferralCoupons);

//Create new referral coupon form submition
router.post("/coupon/referral/add", productImageUpload, refferalCouponController.addReferralCoupon);

//get referral coupon data for edit
router.get("/coupon/referral/edit", refferalCouponController.getReferralCoupon);

//sumbit edited referral coupon data
router.patch("/coupon/referral/edit", productImageUpload, refferalCouponController.saveReferralCoupon);

//block and unblock referral coupons
router.patch("/coupon/referral/block", refferalCouponController.blockReferralCoupon);

//This router for search referral coupon
router.get("/coupon/referral/search", refferalCouponController.searchReferralCoupons);



//@desc Router for sales report
//get sales report
router.get("/salesreport", salesReportController.getSalesReport);

//download sales report in pdf
router.get("/salesreport/pdf/download", salesReportController.getSalesReportPdf);

//download sales report in excel
router.get("/salesreport/excel/download", salesReportController.downloadSalesReportExcel);





//@desc Router for adimin order section.
//for admin list all orders
router.get("/get-orders-admin", orderController.getOrdersAdmin)

// PUT route to update order status
router.put('/orders/status', orderController.updateOrderItemStatus);

// Router for approve and reject order return
router.put('/orders/:orderId/return-request', orderController.handleReturnRequest);

//approve refund for cancelled and returned product
router.post("/refund", orderController.approveRefund);

export default router