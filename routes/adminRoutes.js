import express from 'express'
import { blockUser, getAdminLogin, verifyAdminLogin, getAdminHome, getUsers, unBlockUser, getUsersSearch, createNewCategory, getCategoryList, getCategorySearch, editCategoryForm, editCategory, statusCategory, getProducts, getProductsSearch, getCategoryNames, getChildCategory, addNewProduct, getProductData } from '../controllers/adminControllers.js'
import { productImageUpload } from '../middleware/routerMiddleware.js'

const router = express.Router()

//get admin login page
router.get('/adminlogin', getAdminLogin)

//verify admin
router.post("/adminlogin", verifyAdminLogin)

//get admin home
router.get("/adminhome", getAdminHome)

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

//get child category names in product adding form
router.get("/product/category", getChildCategory)

//add new product
router.post("/product/add", productImageUpload, addNewProduct);

//get product data for edit form
router.get("/product/:id", getProductData);

export default router