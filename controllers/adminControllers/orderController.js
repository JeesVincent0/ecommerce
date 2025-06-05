import Product from "../../models/productSchema.js"
import Order from "../../models/ordersSchema.js"
import Wallet from "../../models/walletSchema.js"
import Coupon from "../../models/couponSchema.js"
import logger from '../../utils/logger.js';

const orderController = {

    //@desc get all orders
    //GET /get-orders-admin
    getOrdersAdmin: async (req, res) => {
        try {
            const { page = 1, limit = 100, searchKey = "" } = req.query;

            // Convert page and limit to numbers
            const pageNumber = parseInt(page);
            const pageLimit = parseInt(limit);

            // Calculate the skip value for pagination
            const skip = (pageNumber - 1) * pageLimit;

            // Build the search filter if a search key is provided
            const searchFilter = searchKey
                ? {
                    $or: [
                        { orderId: { $regex: searchKey, $options: 'i' } },
                        { userName: { $regex: searchKey, $options: 'i' } },
                        { orderStatus: { $regex: searchKey, $options: 'i' } },
                    ]
                }
                : {};

            // Fetch orders with pagination and search
            const orders = await Order.find(searchFilter)
                .populate("items.productId") // assuming your schema has items.productId as a ref to Product
                .sort({ placedAt: -1 })
                .skip(skip)
                .limit(pageLimit);

            // Get the total count of orders (for pagination)
            const totalOrders = await Order.countDocuments(searchFilter);

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalOrders / pageLimit);

            res.json({
                success: true,
                orders,
                totalPages,
                currentPage: pageNumber,
                totalOrders,
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc change one item status
    //router PUT /orders/status
    updateOrderItemStatus: async (req, res) => {
        try {
            const { status, orderId, productId } = req.body;

            if (!orderId || !productId || !status) {
                return res.status(400).json({ success: false, message: 'Missing orderId, productId or status' });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            const item = order.items.find(
                (item) => item.productId.toString() === productId.toString()
            );

            if (!item) {
                return res.status(404).json({ success: false, message: 'Product not found in order' });
            }

            const previousStatus = item.orderStatus;

            //Restore stock only if transitioning from a valid state to cancelled/returned
            if (
                ['cancelled', 'returned'].includes(status) &&
                !['cancelled', 'returned'].includes(previousStatus)
            ) {
                const product = await Product.findById(productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            //Update item status
            item.orderStatus = status;

            //Recalculate totals (exclude cancelled items)
            const validItems = order.items.filter(i => i.orderStatus !== 'cancelled');

            const updatedTotalAmount = validItems.reduce((sum, i) => {
                return sum + (i.priceAtPurchase * i.quantity);
            }, 0);

            //Recalculate discount if coupon exists
            let discountAmount = 0;

            if (order.coupon && order.coupon.code) {
                const coupon = await Coupon.findOne({ code: order.coupon.code });

                if (coupon) {
                    if (coupon.discountType === 'fixed') {
                        discountAmount = coupon.discountValue;
                    } else if (coupon.discountType === 'percentage') {
                        const percentage = (coupon.discountValue / 100) * updatedTotalAmount;
                        discountAmount = coupon.maxDiscount
                            ? Math.min(percentage, coupon.maxDiscount)
                            : percentage;
                    }

                    // Ensure discount doesn't exceed the updated total
                    if (discountAmount > updatedTotalAmount) {
                        discountAmount = updatedTotalAmount;
                    }
                }
            }

            //Update order totals
            order.totalAmount = updatedTotalAmount;
            order.grandTotal = updatedTotalAmount - discountAmount;
            order.coupon.discountAmount = discountAmount;

            await order.save();

            res.json({ success: true, message: 'Item status updated and order totals adjusted successfully' });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    //@desc return request approve and reject
    //router PUT /orders/:orderId/return-request
    handleReturnRequest: async (req, res) => {
        const { orderId } = req.params;
        const { approve, productId } = req.body;

        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const item = order.items.find(i => i.productId.toString() === productId);
            if (!item) {
                return res.status(404).json({ success: false, message: "Product not found in order" });
            }

            if (!item.returnRequest) {
                return res.status(400).json({ success: false, message: "No return requested for this item" });
            }

            if (approve) {
                // Step 1: Revert stock
                const product = await Product.findById(productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }

                // Step 2: Calculate item total
                const itemTotal = item.priceAtPurchase * item.quantity;

                // Step 3: Adjust coupon amount if exists
                let discountOnItem = 0;
                if (order.coupon && order.coupon.code) {
                    const coupon = await Coupon.findOne({ code: order.coupon.code });

                    if (coupon) {
                        if (coupon.discountType === 'fixed') {
                            const totalItemsCost = order.items.reduce((sum, i) => {
                                return sum + (i.orderStatus !== 'returned' ? i.priceAtPurchase * i.quantity : 0);
                            }, 0);

                            // Proportionally distribute fixed discount
                            discountOnItem = (itemTotal / totalItemsCost) * order.coupon.discountAmount;

                        } else if (coupon.discountType === 'percentage') {
                            discountOnItem = (itemTotal * coupon.discountValue) / 100;
                            if (coupon.maxDiscount) {
                                discountOnItem = Math.min(discountOnItem, coupon.maxDiscount);
                            }
                        }
                    }
                }

                // Step 4: Update amounts and item status
                const adjustedAmount = itemTotal - discountOnItem;

                order.totalAmount -= itemTotal;
                order.grandTotal -= adjustedAmount;

                item.orderStatus = 'returned';
                item.returnRequest = false;
                item.returnReason = ''; // Optional: clear reason

            } else {
                // Reject return
                item.orderStatus = 'delivered';
                item.returnRequest = false;
            }

            await order.save();

            res.json({ success: true, message: "Return request handled successfully" });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    //@desc approve redund for canceled and returned order items
    // POST /refund
    approveRefund: async (req, res) => {
        try {
            const { orderId, status, productId } = req.body;

            const order = await Order.findOne({ orderId });

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const product = order.items.find(item => item.productId.toString() === productId);

            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found in order" });
            }

            if (product.orderStatus !== "returned") {
                return res.status(400).json({ success: false, message: "Product is not marked as returned" });
            }

            // Update refund status for that specific product
            const updatedItems = order.items.map(item => {
                if (item.productId.toString() === productId) {
                    return {
                        ...item.toObject(),
                        refund: status === "approve" ? "approve" : "reject"
                    };
                }
                return item;
            });

            order.items = updatedItems;
            await order.save();

            // If refund is approved, calculate refund for that product
            if (status === "approve") {
                let refundAmount = product.priceAtPurchase * product.quantity;

                // Apply proportional coupon discount if used
                if (order.coupon?.discountAmount) {
                    const orderSubtotal = order.items.reduce((sum, item) => {
                        return sum + (item.priceAtPurchase * item.quantity);
                    }, 0);

                    const productShare = (product.priceAtPurchase * product.quantity) / orderSubtotal;
                    const proportionalDiscount = order.coupon.discountAmount * productShare;

                    refundAmount -= proportionalDiscount;
                }

                // Round to 2 decimals
                refundAmount = Math.round(refundAmount * 100) / 100;

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
                    reason: order.coupon?.code
                        ? `Refund for product (with coupon: ${order.coupon.code})`
                        : 'Refund for product',
                    orderId: order._id
                });

                await wallet.save();
            }

            res.json({ success: true });

        } catch (error) {
            console.error("Partial Refund Error:", error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },
}

export default orderController;