import User from "../models/userSchema.js"
import bcrypt, { hash } from 'bcrypt'
import { createToken } from "./JWT.js"

//@desc render admin login page
//GET /adminlogin
export const getAdminLogin = (req, res) => {
    res.render('admin/login')
}

//@desc verify admin email and password
//POST /login
export const verifyAdminLogin = async (req, res) => {
    try {

        //getting form data for admin verification
        const { email, password } = req.body

        //admin mailId and status checking
        const admin = await User.findOne({ email })
        if (!admin) throw new Error("Wrong email")
        if (!admin.isAdmin) throw new Error("Wrong email")

        //password checking
        const pass = await bcrypt.compare(password, admin.hashPassword)
        if (!pass) throw new Error("Wrong password")

        const token = createToken(admin.email, '1h')
        res.cookie("jwt", token, { httpOnly: true })

        //success response with next page url
        res.json({ success: true, redirectUrl: "/adminhome", email: true, password: true })

    } catch (error) {
        if (error.message === "Wrong email") {
            res.status(401).json({ email: false })
        } else if (error.message === "Wrong password") {
            res.status(401).json({ password: false, email: true })
        }
    }
}

//@desc render admin home
//GET /adminhome
export const getAdminHome = (req, res) => {
    res.render("admin/adminMainLayout")
}

//@desc pass users to fronend
//GET /users
export const getUsers = async (req, res) => {

    //getting data from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    //settup for get users
    const skip = (page - 1) * limit;
    const filter = {
        $or: [
            { isAdmin: false },
            { isAdmin: { $exists: false } }
        ]
    };

    //getting user and count for pagination
    const users = await User.find(filter).select('name email isActive -_id').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit)

    res.json({ users, totalPages: totalPages, currentPage: page });
}

//@desc block user
//GET /users/block
export const blockUser = async (req, res) => {
    try {

        //getting data from query params
        const email = req.query.email;

        //blocking user and send response
        const user = await User.updateOne({ email }, { $set: { isActive: false } })
        res.json({ success: true, message: "User blocked" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

//@desc unblock user
//GET /users/unblock
export const unBlockUser = async (req, res) => {
    try {

        //getting data from query params
        const email = req.query.email;

        //unblocking user and send response
        const user = await User.updateOne({ email }, { $set: { isActive: true } });
        res.json({ success: true, message: "User unbloked" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Something went wrong" })
    }
}

//@desc get users using search keywords
//GET /users/search?key=data
export const getUsersSearch = async (req, res) => {

    //getting data from query params
    const keyword = req.query.key;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    //settup for get users
    const regxKey = new RegExp(keyword, 'i')
    const skip = (page - 1) * limit
    const filter = {
        $or: [
            { isAdmin: false },
            { isAdmin: { $exists: false } }
        ],
        $or: [
            { name: { $regex: regxKey } },
            { email: { $regex: regxKey } }
        ]
    }

    //getting user and count for pagination
    const users = await User.find(filter).select('name email isActive -_id').sort({ createdAt: -1 }).skip(skip).limit(limit)
    const totalUsers = await User.countDocuments(filter)
    const totalPages = Math.ceil(totalUsers / limit)

    res.json({ users, totalPages: totalPages, currentPage: page })
}