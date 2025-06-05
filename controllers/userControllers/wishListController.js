import process from 'process';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import Wishlist from '../../models/whishlistSchma.js';

const wishListController = {

    //@desc render wishlist in user side
    // GET /wishlist
    renderWishlist: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            if (!token) return res.status(401).json({ success: false, message: "No token provided" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.userEmail;

            const user = await User.findOne({ email: userEmail });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            const wishlist = await Wishlist.findOne({ userId: user._id }).populate('products.productId');

            wishlist ? wishlist.products.map(item => item.productId) : [];
            res.render("user/wishlist", { wishlist })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc add product to wishlist
    //POST /wishlist/add
    addToWishlist: async (req, res) => {
        try {
            const { productId } = req.body;

            const token = req.cookies.jwt;
            if (!token) return res.status(401).json({ success: false, message: "No token provided" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.userEmail;

            const user = await User.findOne({ email: userEmail });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            const userId = user._id

            // Find if wishlist exists for the user
            let wishlist = await Wishlist.findOne({ userId });

            if (wishlist) {
                // Check if product is already in wishlist
                const alreadyExists = wishlist.products.some(
                    item => item.productId.toString() === productId
                );

                if (!alreadyExists) {
                    wishlist.products.push({ productId });
                    await wishlist.save();
                }
            } else {
                // Create new wishlist for user
                wishlist = new Wishlist({
                    userId,
                    products: [{ productId }]
                });
                await wishlist.save();
            }

            res.status(200).json({ message: 'Added to wishlist successfully' });
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Server error' });
        }
    },

    //@desc remove wishlist
    //DELETE /wishlist/remove
    removeFromWishlist: async (req, res) => {
        try {
            const { productId } = req.body;


            const token = req.cookies.jwt;
            if (!token) return res.status(401).json({ success: false, message: "No token provided" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userEmail = decoded.userEmail;

            const user = await User.findOne({ email: userEmail });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            const userId = user._id;

            await Wishlist.updateOne(
                { userId },
                { $pull: { products: { productId } } }
            );

            res.json({ success: true });
        } catch (err) {
            logger.error(err)
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
}

export default wishListController;