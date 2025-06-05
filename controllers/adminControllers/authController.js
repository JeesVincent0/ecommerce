import User from "../../models/userSchema.js"
import bcrypt from 'bcrypt'
import { createToken } from ".././JWT.js"
import logger from '../../utils/logger.js';

const authController = {

    //@desc render admin login page
    //GET /adminlogin
    getAdminLogin: (req, res) => {
        try {
            res.render('admin/login')
        } catch (error) {
            logger.error(error);
        }
    },

    //@desc verify admin email and password
    //POST /login
    verifyAdminLogin: async (req, res) => {
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
            logger.error(error)
            if (error.message === "Wrong email") {
                res.status(401).json({ email: false })
            } else if (error.message === "Wrong password") {
                res.status(401).json({ password: false, email: true })
            }
        }
    },

}

export default authController;