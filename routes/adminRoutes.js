import express from 'express'
import { blockUser, getAdminLogin, verifyAdminLogin, getAdminHome, getUsers, unBlockUser, getUsersSearch } from '../controllers/adminControllers.js'


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
  

export default router