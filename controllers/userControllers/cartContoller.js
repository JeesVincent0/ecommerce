import process from 'process';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js';
import Cart from '../../models/cartSchema.js';
import Coupon from "../../models/couponSchema.js";
import Product from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import Wishlist from '../../models/whishlistSchma.js';

const cartController = {

    //@desc get cart details 
    //GET /get-cart
    getCartDetails: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email }).select("_id");

            let cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

            if (!cart) {
                return res.json({ success: true, cart: null });
            }

            // Check each item for stock
            const updatedItems = [];
            for (const item of cart.items) {
                const product = item.productId;
                if (product && product.stock >= item.quantity) {
                    updatedItems.push(item); // Stock is enough
                }
            }

            // If items were removed
            if (updatedItems.length !== cart.items.length) {
                cart.items = updatedItems;
                await cart.save(); // Save updated cart
            }

            // Populate productId again to return full product details
            cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
            const coupons = await Coupon.find()


            res.json({ success: true, cart, coupons });

        } catch (error) {
            logger.error(error.toString());
            res.json({ success: false });
        }
    },

    //@desc render cart page
    //GET /cart
    renderCart: (req, res) => {
        try {
            res.render("user/cart")
        } catch (error) {
            logger.error(error)
            res.json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc add new product to cart
    //POST /add-to-cart/:id
    addToCart: async (req, res) => {
        try {
            const productId = req.params.id;
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email });
            const userId = user._id;

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            if (product.stock <= 0) {
                return res.status(400).json({ success: false, message: "Product out of stock" });
            }

            let price;

            const category = await Category.findOne({ _id: product.category_id }, { offers: 1, _id: 0 });
            if (category.offers <= product.discount_percentage) {
                price = product.mrp - (product.mrp * (product.discount_percentage / 100))
            } else {
                price = product.mrp - (product.mrp * (category.offers / 100))
            }


            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({
                    userId,
                    items: [{
                        productId,
                        quantity: 1,
                        priceAtTime: price
                    }]
                });
            } else {
                const existingItem = cart.items.find(item => item.productId.equals(productId));

                if (existingItem) {
                    if (existingItem.quantity + 1 > product.stock) {
                        return res.status(400).json({ success: false, message: "Not enough stock available" });
                    }
                    existingItem.quantity += 1;
                    existingItem.priceAtTime = price;
                } else {
                    cart.items.push({
                        productId,
                        quantity: 1,
                        priceAtTime: price
                    });
                }
            }

            cart.updatedAt = new Date();
            await cart.save();

            //Remove the product from the wishlist if it exists
            await Wishlist.updateOne(
                { userId },
                { $pull: { products: { productId } } }
            );

            res.json({ success: true });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    // @desc Decrement item quantity in cart
    // @route POST /decrement-cart/:id
    decreamentItem: async (req, res) => {
        try {
            const productId = req.params.id;
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;

            const user = await User.findOne({ email }).select('_id');
            const cart = await Cart.findOne({ userId: user._id });

            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }

            const item = cart.items.find(i => i.productId.equals(productId));

            if (item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    await cart.save();
                    return res.json({ success: true });
                } else {
                    return res.json({ success: false, message: 'Minimum quantity reached' });
                }
            }

            return res.status(404).json({ success: false, message: 'Product not in cart' });

        } catch (error) {
            logger.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    // @desc Delete cart item
    // @route DELETE /delete-item/:id
    deleteItem: async (req, res) => {
        try {
            const productId = req.params.id;
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
    
            const user = await User.findOne({ email }).select('_id');
            const cart = await Cart.findOne({ userId: user._id });
    
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }
    
            // Filter out the item to delete
            cart.items = cart.items.filter(item => !item.productId.equals(productId));
    
            await cart.save();
    
            return res.json({ success: true, message: 'Item removed from cart' });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
}

export default cartController;