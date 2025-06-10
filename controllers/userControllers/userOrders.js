//imorting shema files
import Address from "../../models/addressSchema.js";
import Cart from "../../models/cartSchema.js";
import Coupon from "../../models/couponSchema.js";
import Order from "../../models/ordersSchema.js";
import Product from "../../models/productSchema.js";
import User from "../../models/userSchema.js";
import Wallet from "../../models/walletSchema.js";
import process from 'process'
import fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//importing other files
import logger from "../../utils/logger.js";
import { generateOrderId } from "../../utils/generateOrderId.js";

//importing installed files
import jwt from 'jsonwebtoken';
import generateInvoice from "../../utils/generateInvoice.js";

const userOrderController = {

    //@desc cancell order
    // PUT /orders/:id/cancel
    cancelOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ success: false, message: 'Product ID is required' });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            const item = order.items.find(item => item.productId.toString() === productId.toString());
            if (!item) {
                return res.status(404).json({ success: false, message: 'Product not found in order' });
            }

            if (['cancelled', 'delivered', 'returned'].includes(item.orderStatus)) {
                return res.status(400).json({ success: false, message: 'Cannot cancel this item' });
            }

            // 1. Restore stock
            const product = await Product.findById(productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }

            // 2. Cancel item
            item.orderStatus = 'cancelled';

            // 3. Recalculate totals from non-cancelled items
            const validItems = order.items.filter(i => i.orderStatus !== 'cancelled');

            const updatedTotalAmount = validItems.reduce((acc, i) => {
                return acc + (i.priceAtPurchase * i.quantity);
            }, 0);

            // 4. Reapply coupon if applicable
            let discountAmount = 0;
            if (order.coupon?.code) {
                const coupon = await Coupon.findOne({ code: order.coupon.code });
                if (coupon) {
                    if (coupon.discountType === 'fixed') {
                        discountAmount = coupon.discountValue;
                    } else if (coupon.discountType === 'percentage') {
                        const percentDiscount = (coupon.discountValue / 100) * updatedTotalAmount;
                        discountAmount = coupon.maxDiscount
                            ? Math.min(percentDiscount, coupon.maxDiscount)
                            : percentDiscount;
                    }
                    if (discountAmount > updatedTotalAmount) {
                        discountAmount = updatedTotalAmount;
                    }
                }
            }

            // 5. Update totals
            const updatedGrandTotal = updatedTotalAmount - discountAmount;
            order.totalAmount = updatedTotalAmount;
            order.grandTotal = updatedGrandTotal;
            order.coupon.discountAmount = discountAmount;

            // 6. Refund to wallet if prepaid via Razorpay
            if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {
                const refundAmount = item.priceAtPurchase * item.quantity;
                if (!isNaN(refundAmount) && refundAmount > 0) {
                    let wallet = await Wallet.findOne({ userId: order.userId });
                    if (!wallet) {
                        wallet = new Wallet({
                            userId: order.userId,
                            balance: 0,
                            transactions: []
                        });
                    }

                    wallet.balance += refundAmount;

                    wallet.transactions.push({
                        type: 'credit',
                        amount: refundAmount,
                        reason: `Refund for cancelled item in order #${order.orderId || order._id}`,
                        orderId: order._id
                    });

                    await wallet.save();
                }
            }

            // 7. Save updated order
            await order.save();

            return res.json({
                success: true,
                message: 'Item cancelled, stock restored, totals updated and refund (if Razorpay) processed'
            });

        } catch (err) {
            logger.error(err.toString());
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    //@desc render orders page
    //GET /orders
    ordersPage: async (req, res) => {
        try {
            res.render("user/orders")
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc get all orders
    //GET /get-orders
    getOrders: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email }).select("_id");

            const orders = await Order.find({ userId: user._id })
                .sort({ placedAt: -1 })
                .populate({ path: "items.productId", select: "product_name price images" })
                .populate({ path: "userId", select: "name email" });

            res.json({ success: true, orders });
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc return request for delivered items
    //router PUT /orders/:id/return
    returnOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { reason, productId } = req.body;

            if (!reason || !productId) {
                return res.status(400).json({ success: false, message: "Return reason and productId are required" });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // Find the item to be returned
            const item = order.items.find(item => item.productId.toString() === productId.toString());
            if (!item) {
                return res.status(404).json({ success: false, message: "Product not found in the order" });
            }

            // Allow return only if item is delivered
            if (item.orderStatus !== 'delivered') {
                return res.status(400).json({ success: false, message: "Only delivered items can be returned" });
            }

            // Mark return request
            item.returnRequest = true;
            item.returnReason = reason;

            await order.save();

            res.status(200).json({ success: true, message: "Return request saved for the item" });

        } catch (err) {
            logger.error(err.toString());
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    //@desc checkout from cart
    //GET /checkout
    checkOut: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;

            const user = await User.findOne({ email }).select('_id');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const cart = await Cart.findOne({ userId: user._id });
            if (!cart || !cart.items || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Cart is empty' });
            }

            const updatedItems = [];
            const removedProducts = [];

            for (const item of cart.items) {
                const product = await Product.findById(item.productId).select('stock product_name');
                if (!product || product.stock < item.quantity) {
                    removedProducts.push(product?.product_name || 'Unknown Product');
                    // Don't push to updatedItems (removes from cart)
                } else {
                    updatedItems.push(item);
                }
            }

            // Update cart and throw error if items were removed
            if (removedProducts.length > 0) {
                cart.items = updatedItems;
                await cart.save();

                return res.status(400).json({
                    success: false,
                    message: 'Some products were removed from cart due to insufficient stock',
                    removedProducts,
                });
            }

            const address = await Address.find({ userId: user._id });

            res.json({ success: true, address });

        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    //@desc create new order
    //POST /select-address
    createOrder: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Cart is empty' });
            }

            // Check stock for each item
            const updatedItems = [];
            const removedItems = [];

            for (const item of cart.items) {
                const product = item.productId;
                if (!product || product.stock < item.quantity) {
                    removedItems.push(product?.product_name || 'Unknown Product');
                } else {
                    updatedItems.push(item);
                }
            }

            // If any items were removed, update the cart and return error
            if (removedItems.length > 0) {
                cart.items = updatedItems;
                await cart.save();

                return res.status(400).json({
                    success: false,
                    message: 'Some products were removed from cart due to insufficient stock',
                    removedProducts: removedItems
                });
            }

            // Proceed if all items are in stock
            const { addressId } = req.body;
            const shippingAddress = await Address.findOne({ _id: addressId, userId: user._id });
            if (!shippingAddress) {

                return res.json({ success: false, message: 'Shipping address not found this is throwed now' });
            }

            const totalAmount = cart.items.reduce((sum, item) => {
                return sum + (item.priceAtTime * item.quantity);
            }, 0);

            const newOrder = new Order({
                orderId: generateOrderId(),
                userId: user._id,
                userName: user.name,
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtTime,
                    productPrice: item.productId.mrp,
                })),
                shippingAddress: {
                    housename: shippingAddress.housename,
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postalCode: shippingAddress.postalCode,
                    label: shippingAddress.label,
                    phone: user.phone
                },
                totalAmount,
                grandTotal: totalAmount,
                orderStatus: 'failed'
            });

            await newOrder.save();

            res.status(200).json({
                success: true,
                orderId: newOrder._id,
                message: 'Order created successfully'
            });

        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ success: false, message: 'Something went wrong' });
        }
    },

    //router PATCH /order/item/cancel
    cancelOrderItemController: async (req, res) => {
        try {
            const { orderId, itemId } = req.body;

            if (!orderId || !itemId) {
                return res.status(400).json({ success: false, message: 'Missing orderId or itemId.' });
            }

            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);

            if (itemIndex === -1) {
                return res.status(404).json({ success: false, message: 'Item not found in order.' });
            }

            // Add status to the item if not exists
            if (!order.items[itemIndex].status || order.items[itemIndex].status !== 'cancelled') {
                order.items[itemIndex].status = 'cancelled';
                await order.save();
            }

            res.json({ success: true, message: 'Item cancelled successfully.' });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    },

    //@desc Invoice for delivered products
    //router GET /orders/:id/invoice
    getInvoice: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate('items.productId');
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            const invoicePath = path.join(__dirname, '..', 'invoices', `${order._id}.pdf`);

            // Check if invoice already exists, otherwise generate
            if (!fs.existsSync(invoicePath)) {
                generateInvoice(order, invoicePath);
            }

            // Wait a little for file to be ready
            setTimeout(() => {
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=invoice-${order._id}.pdf`
                });
                res.sendFile(invoicePath);
            }, 500);

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    //@desc render success page after payment success
    //router GET /order-success
    renderSuccess: (req, res) => {
        try {
            res.render("user/placedSuccess")
        } catch (error) {
            logger.error(error.toString());
        }
    },

    //@desc render order failed page
    //GET /order-failed
    renderFailed: (req, res) => {
        try {
            res.render("user/placedFailed")
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },
}

export default userOrderController