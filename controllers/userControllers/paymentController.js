import process from 'process';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';
import User from '../../models/userSchema.js'
import Cart from '../../models/cartSchema.js'
import instance from "../../utils/razorpay.js"
import Order from '../../models/ordersSchema.js'
import Coupon from "../../models/couponSchema.js"
import Product from "../../models/productSchema.js"
import { generateOrderId } from '../../utils/generateOrderId.js'
import referralCoupon from "../../models/referralCouponSchema.js"
import crypto from "crypto";

const paymentController = {

    //@desc select payment method
    //POST /place-order
    paymentMethods: async (req, res) => {
        const { orderId, paymentMethod } = req.body;

        if (!orderId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing order ID or payment method." });
        }

        try {
            const order = await Order.findById(orderId).populate("items.productId");
            if (!order) return res.status(404).json({ success: false, message: "Order not found." });

            // Enforce payment method rule (COD only if total <= 1000)
            if (paymentMethod === 'cod' && order.grandTotal > 1000) {
                return res.status(400).json({
                    success: false,
                    message: "COD is allowed only for orders below ₹1000. Please select an online payment method."
                });
            }

            // Get user
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email });

            // Check stock
            const updatedItems = [];
            const removedProducts = [];

            for (const item of order.items) {
                const product = await Product.findById(item.productId._id);
                if (!product || product.stock < item.quantity) {
                    removedProducts.push(product?.product_name || "Unknown Product");
                } else {
                    updatedItems.push(item);
                }
            }

            // If stock is not enough
            if (removedProducts.length > 0) {
                // Remove items from order and save
                order.items = updatedItems;
                await order.save();

                // Also update user's cart
                const cart = await Cart.findOne({ userId: user._id });
                if (cart) {
                    cart.items = cart.items.filter(cartItem =>
                        updatedItems.some(orderItem => orderItem.productId._id.toString() === cartItem.productId.toString())
                    );
                    await cart.save();
                }

                return res.status(400).json({
                    success: false,
                    message: "Some products were removed due to insufficient stock",
                    removedProducts
                });
            }

            // Proceed with payment
            const newOrderId = generateOrderId();
            order.paymentMethod = paymentMethod;
            order.orderPlaced = true;
            order.orderId = newOrderId;
            order.orderStatus = "placed";

            //Set each item's orderStatus to "processing"
            order.items = order.items.map(item => ({
                ...item.toObject(),
                orderStatus: "processing"
            }));

            // Razorpay Payment
            if (paymentMethod === "razorpay") {
                const razorpayOrder = await instance.orders.create({
                    amount: Math.round(order.grandTotal * 100),
                    currency: "INR",
                    receipt: `receipt_${newOrderId}`,
                });

                return res.json({
                    success: true,
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    key: process.env.RAZORPAY_KEY_ID,
                    orderId: order._id,
                    cod: false
                });
            }

            // Decrease product stock
            for (let item of order.items) {
                const product = await Product.findById(item.productId._id);
                if (product) {
                    product.stock -= item.quantity;
                    if (product.stock < 0) product.stock = 0;
                    await product.save();
                }
            }

            await order.save();

            // Handle Coupon Use
            const couponCode = order?.coupon?.code;
            const userId = user._id;

            if (couponCode) {
                const coupon = await Coupon.findOne({ code: couponCode });
                if (coupon) {
                    const userIndex = coupon.usedBy.findIndex(entry => entry.userId.toString() === userId.toString());

                    if (userIndex !== -1) {
                        coupon.usedBy[userIndex].usageCount += 1;
                    } else {
                        coupon.usedBy.push({ userId, usageCount: 1 });
                    }

                    await coupon.save();
                    await Coupon.updateMany({ code: couponCode }, { $inc: { totalUsageLimit: -1, usedCount: 1 } });
                }

                const refCoupon = await referralCoupon.findOne({ code: couponCode });
                if (refCoupon) {
                    await referralCoupon.updateOne(
                        { code: couponCode, "applicableUsers.userId": userId },
                        { $inc: { "applicableUsers.$.limit": -1 } }
                    );
                }
            }

            // Clear cart
            await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });

            return res.json({
                success: true,
                message: "Order placed with Cash on Delivery",
                razorpayOrderId: false,
                cod: true
            });

        } catch (err) {
            logger.error(err)
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    //@desc verify razorpay payment transaction
    //POST /verify-payment
    verifyPayment: async (req, res) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;

            const user = await User.findOne({ email });

            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {

                const order = await Order.findById(orderId).populate("items.productId");

                // Proceed with payment
                const newOrderId = generateOrderId();
                order.orderPlaced = true;
                order.orderId = newOrderId;
                order.orderStatus = "placed";
                order.paymentMethod = "razorpay";
                order.paymentStatus = "paid";

                //Set each item's orderStatus to "processing"
                order.items = order.items.map(item => ({
                    ...item.toObject(),
                    orderStatus: "processing"
                }));

                await order.save();

                // Decrease product stock
                for (let item of order.items) {
                    const product = await Product.findById(item.productId._id);
                    if (product) {
                        product.stock -= item.quantity;
                        if (product.stock < 0) product.stock = 0;
                        await product.save();
                    }
                }

                const couponCode = order.coupon.code;
                const userId = user._id
                // Step 1: Find the coupon
                const coupon = await Coupon.findOne({ code: couponCode });

                if (coupon) {
                    // Step 2: Check if user already used the coupon
                    const userIndex = coupon.usedBy.findIndex(entry => entry.userId.toString() === userId.toString());

                    if (userIndex !== -1) {
                        // User exists, increment usageCount
                        coupon.usedBy[userIndex].usageCount += 1;
                    } else {
                        // New user, add to usedBy array
                        coupon.usedBy.push({ userId, usageCount: 1 });
                    }

                    // Step 3: Save the updated coupon
                    await coupon.save();
                    await Coupon.updateMany({ code: couponCode }, { $inc: { totalUsageLimit: -1, usedCount: 1 } })
                }

                const referralcoupon = await referralCoupon.findOne({ code: couponCode });

                if (referralcoupon) {
                    await referralCoupon.updateOne(
                        {
                            code: couponCode,
                            "applicableUsers.userId": userId  // Match the user inside the array
                        },
                        {
                            $inc: { "applicableUsers.$.limit": -1 }  // Decrease the limit by 1
                        }
                    );
                }
                // Clear the cart
                await Cart.findOneAndUpdate({ userId: user._id }, { items: [] });
                return res.json({ success: true });
            } else {
                return res.status(400).json({ success: false, message: "Payment verification failed" });
            }
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },
}

export default paymentController;