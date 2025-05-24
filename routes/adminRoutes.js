import express from 'express'
import { blockUser, getAdminLogin, verifyAdminLogin, getAdminHome, getUsers, unBlockUser, getUsersSearch, createNewCategory, getCategoryList, getCategorySearch, editCategoryForm, editCategory, statusCategory, getProducts, getProductsSearch, getCategoryNames, getChildCategory, addNewProduct, getProductData, editProduct, deleteProduct, handleReturnRequest, updateOrderStatus, toggleCategoryStatus, getUserDetailsAndOrders, toggleProductStatus, getCoupons, addCoupon, getCoupon, saveCoupon, blockCoupon, searchCoupons, approveRefund, getReferralCoupons, addReferralCoupon, getReferralCoupon, saveReferralCoupon, blockReferralCoupon, searchReferralCoupons, getSalesReport, getSalesReportPdf, downloadSalesReportExcel } from '../controllers/adminControllers.js'
import { productImageUpload, redirectIfAuthenticatedAdmin, verifyAdminJWT } from '../middleware/routerMiddleware.js'

const router = express.Router()

//get admin login page
router.get('/adminlogin',redirectIfAuthenticatedAdmin, getAdminLogin)

//verify admin
router.post("/adminlogin", verifyAdminLogin)

//get admin home
router.get("/adminhome",verifyAdminJWT, getAdminHome)

//get admin users list
router.get('/users', getUsers);

//bolck user
router.get("/users/block", blockUser)

//unblock user
router.get("/users/unblock", unBlockUser);

//get user using search keywords
router.get("/users/search", getUsersSearch);

//get cotegory list
router.get("/category", getCategoryList);

//create new category
router.post("/category", createNewCategory);

//get category data names and slug for selection
router.get("/category/miancategory/:parentId", getCategoryNames);

//get category using search keywords
router.get("/category/search", getCategorySearch)

//get data for edit category
router.get("/category/edit", editCategoryForm);

//edit category
router.patch("/category/edit", editCategory)

//block and unblock category
router.patch('/category/block/:slug', statusCategory);

//get products list
router.get("/products", getProducts);

//product search
router.get("/products/search", getProductsSearch)

//get available category
router.get("/product/category", getChildCategory)

//add new product
router.post("/product/add", productImageUpload, addNewProduct);

//get product data for edit form
router.get("/product/:id", getProductData);

//edit product details
router.post('/product/edit',  productImageUpload, editProduct);


//product delete
router.delete("/product/delete/:id", deleteProduct);

// Backend (Express)
// router.put('/orders/:orderId/status', updateOrderStatus)

//block and unblock category
router.patch('/toggle-status/:id', toggleCategoryStatus);

router.put('/orders/:orderId/return-request', handleReturnRequest);

router.get('/user-details/:email', getUserDetailsAndOrders);

router.patch('/admin/products/:id/status', toggleProductStatus);

//get all coupons
router.get("/coupon", getCoupons);

//add new coupen
router.post("/coupon/add", productImageUpload, addCoupon);

//get coupon data for edit coupon
router.get("/coupon/edit", getCoupon);

//save edited coupon data
router.patch("/coupon/edit", productImageUpload, saveCoupon);

//block and unblock coupen
router.patch("/coupon/block", blockCoupon);

//search coupon;
router.get('/coupon/search', searchCoupons);

//get Referral coupons
router.get("/coupon/referral", getReferralCoupons);

//Create new referral coupon form submition
router.post("/coupon/referral/add", productImageUpload, addReferralCoupon);

//get referral coupon data for edit
router.get("/coupon/referral/edit", getReferralCoupon);

//approve refund for cancelled and returned product
router.post("/refund", approveRefund);

//sumbit edited referral coupon data
router.patch("/coupon/referral/edit", productImageUpload, saveReferralCoupon);

//block and unblock referral coupons
router.patch("/coupon/referral/block", blockReferralCoupon);

//This router for search referral coupon
router.get("/coupon/referral/search", searchReferralCoupons)

//get sales report
router.get("/salesreport", getSalesReport);

//download sales report in pdf
router.get("/salesreport/pdf/download", getSalesReportPdf);

//download sales report in excel
router.get("/salesreport/excel/download", downloadSalesReportExcel);

export default router