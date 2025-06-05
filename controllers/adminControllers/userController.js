import logger from '../../utils/logger.js';
import User from "../../models/userSchema.js"
import Order from '../../models/ordersSchema.js';

const userController = {

    //@desc pass users to fronend
    //GET /users
    getUsers: async (req, res) => {
        try {
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
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc block user
    //GET /users/block
    blockUser: async (req, res) => {
        try {

            //getting data from query params
            const email = req.query.email;

            //blocking user and send response
            await User.updateOne({ email }, { $set: { isActive: false } })
            res.json({ success: true, message: "User blocked" })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc unblock user
    //GET /users/unblock
    unBlockUser: async (req, res) => {
        try {

            //getting data from query params
            const email = req.query.email;

            //unblocking user and send response
            await User.updateOne({ email }, { $set: { isActive: true } });
            res.json({ success: true, message: "User unbloked" })

        } catch (error) {
            logger.error(error.message);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc get users using search keywords
    //GET /users/search?key=data
    getUsersSearch: async (req, res) => {
        try {
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
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc get user data for admin section
    //Router GET /user-details/:email
    getUserDetailsAndOrders: async (req, res) => {
      try {
        const email = req.params.email;
    
        // Find user by email (excluding password)
        const user = await User.findOne({ email })
          .select('-password')
          .populate('addresses');
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        // Find all orders for that user, and populate product details inside items
        const orders = await Order.find({ userId: user._id })
          .sort({ placedAt: -1 })
          .populate('items.productId', 'product_name images brand') // Only needed fields
    
        res.json({
          success: true,
          details: {
            user,
            orders
          }
        });
    
      } catch (error) {
        console.error('Error fetching user and orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    },

}

export default userController;