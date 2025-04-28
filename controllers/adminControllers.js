import User from "../models/userSchema.js"
import bcrypt, { hash } from 'bcrypt'
import { createToken } from "./JWT.js"
import Category from "../models/categorySchema.js"
import slugify from "slugify"

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

//@desc get category list
//GET /category
export const getCotegoryList = (req, res) => {

}

//@desc get add category form data
//GET /category/miancaltegory
export const addCategoryData = async (req, res) => {
    try {
        const parentCategory = req.params.parent

        if (!parentCategory || parentCategory === "undefined") {
            const categoryNames = await Category.find({ parentId: null }).select("slug _id")
            res.json({ categoryNames, parent: true })
        } else {
            const categoryNames = await Category.find({ parentId: parentCategory }).select("slug _id")
            if (!categoryNames) emptyCall()
            res.json({ categoryNames, parent: false, child: true })
        }
        function emptyCall() {
            res.json({ categoryNames, parent: false, child: false, parentCategory })
        }
    } catch (error) {
        res.json({ message: "Something went wrong" })
    }
}

//@desc create new category
//POST /category
export const createNewCategory = async (req, res) => {
    try {
        const { parentId, categoryName, categoryStatus, categoryDescription } = req.body
        console.log(parentId, categoryName, categoryStatus, categoryDescription)

        //creating slug from name
        const slug = slugify(categoryName, { lower: true, strict: true })
        console.log("slug success", slug)

        //check if slug is already exists
        const existingCategory = await Category.findOne({ slug })
        if (existingCategory) throw new ("Category with same name already exist.")


        // Find current maximum position under same parent
        let maxPosition = 0;
        if (parentId) {
            const lastCategory = await Category.find({ parentId })
                .sort({ position: -1 })
                .limit(1);
            if (lastCategory.length > 0) {
                maxPosition = lastCategory[0].position;
            }
        } else {
            const lastCategory = await Category.find({ parentId: null })
                .sort({ position: -1 })
                .limit(1);
            if (lastCategory.length > 0) {
                maxPosition = lastCategory[0].position;
            }
        }
        console.log("creating new position success", maxPosition)

        // calculating the level
        let level = 0;
        if (parentId) {
            const parentCategory = await Category.findById(parentId);
            if (parentCategory) {
                level = parentCategory.level + 1
            }
        }
        console.log("creating level", level)

        //creating new category
        const newCategory = new Category({
            name: categoryName,
            slug: slug,
            parentId: parentId || null,
            description: categoryDescription,
            status: categoryStatus,
            level,
        })

        await newCategory.save();
        console.log("new category created")


    } catch (error) {
        if (error.message === "Category with same name already exist.") {
            res.status(400).json({ exist: true, message: "error.message" })
        }
    }
}