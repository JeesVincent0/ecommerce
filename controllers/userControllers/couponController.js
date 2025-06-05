import logger from "../../utils/logger.js";
import User from "../../models/userSchema.js";
import process from 'process';
import jwt from 'jsonwebtoken'
import Order from "../../models/ordersSchema.js";
import Coupon from "../../models/couponSchema.js";
import referralCoupon from "../../models/referralCouponSchema.js";

const couponController = {

    //@desc verify coupon
    //POST /checkcoupon
    verifyCoupon: async (req, res) => {
        try {

            const { code, orderId } = req.body;

            //gettion user from JWT token for check user used the coupon
            const token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const email = decoded.userEmail;
            const user = await User.findOne({ email });


            let updatedOrder
            let totalItems
            let coupon

            const now = new Date();

            //getting normal offer coupon
            const normalCoupon = await Coupon.findOne({ code, status: "active", startDate: { $lte: now }, expiryDate: { $gte: now } });

            //getting refarral offer coupon
            const referralcoupon = await referralCoupon.findOne({ code, status: "active", applicableUsers: { $elemMatch: { userId: user._id, startedDate: { $lte: now }, expiryDate: { $gte: now } } } });

            if (normalCoupon) {
                coupon = normalCoupon;
            } else if (referralcoupon) {
                coupon = referralcoupon
            } else {
                res.json({ success: false, message: "Coupon not valid" })
            }


            if (coupon) {

                //getting order document for edit amount and add coupon details
                const order = await Order.findOne({ _id: orderId });
                logger.info(order)

                //checking the customer purchase amount and coupon minimum purchase value
                if (order.grandTotal < coupon.minPurchase) {
                    res.status(401).json({ success: false, message: `Minimum purchese ₹${coupon.minPurchase}` })
                }

                //checking if the user used the coupon or not and also checking user coupon usage limit too...
                const userUsed = coupon.usedBy.find(
                    (entry) => entry.userId.toString() === user._id.toString()
                );

                if (userUsed && userUsed.usageCount >= coupon.usageLimitPerUser) {
                    return res.status(401).json({ success: false, message: `Coupon usage limit reached (max ${coupon.usageLimitPerUser} times)`, });
                }

                //calculating the coupon discount and updating in the order document
                let grandTotal1 = 0;
                if (coupon.discountType === "fixed") {
                    grandTotal1 = order.grandTotal - coupon.discountValue
                } else {
                    if (((coupon.discountValue / 100) * order.grandTotal) <= coupon.maxDiscount) {
                        grandTotal1 = Math.floor(order.grandTotal - ((coupon.discountValue / 100) * order.grandTotal));
                    } else {
                        grandTotal1 = order.grandTotal - coupon.maxDiscount;
                    }

                }

                if (!order.coupon.code && !order.coupon.discountAmount) {
                    await Order.updateOne({ _id: order._id }, { $set: { grandTotal: grandTotal1, 'coupon.code': coupon.code, 'coupon.discountAmount': order.grandTotal - grandTotal1 } });
                }

                updatedOrder = await Order.findOne({ _id: orderId })
                totalItems = updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0);
            }

            res.json({ success: true, message: "Coupon added succesfully", totalItems, totalPrice: updatedOrder.totalAmount, grandTotal: updatedOrder.grandTotal })


        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Try after sometimes" })
        }
    },

    //@desc render check referral code page after user signup without referral url
    // GET /referralcode 
    renderReferralPage: (req, res) => {
        try {
            res.render("user/referralCode")
        } catch (error) {
            logger.error(`${error.toString()} - [PATH - ${req.method} ${req.originalUrl} ]`)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc check manualy entered referral code agter successfull signup
    //POST /referralcode
    checkReferralCode: async (req, res) => {
        try {
            const referalCode = req.body.code
            logger.info(`Get coupon code from user - [referalCode: ${referalCode}]`)

            const user = await User.findOne({ referalCode })

            if (user) {
                const availableCoupons = await referralCoupon.aggregate([
                    {
                        $match: {
                            status: 'active',
                            totalUsageLimit: { $gt: 0 }
                        }
                    },
                    { $sample: { size: 1 } }
                ]);
                const coupon = availableCoupons[0];

                const startDate = new Date();
                const expiryDate = new Date();
                expiryDate.setDate(startDate.getDate() + coupon.offerDays);

                const existingCoupon = await referralCoupon.findOne({
                    _id: coupon._id,
                    "applicableUsers.userId": user._id
                });

                if (existingCoupon) {

                    await referralCoupon.updateOne(
                        { _id: coupon._id, "applicableUsers.userId": user._id },
                        {
                            $inc: {
                                "applicableUsers.$.limit": 1,
                                totalUsageLimit: -1
                            }
                        }
                    );
                } else {

                    await referralCoupon.updateOne(
                        { _id: coupon._id },
                        {
                            $push: {
                                applicableUsers: {
                                    userId: user._id,
                                    startedDate: startDate,
                                    expiryDate,
                                    limit: 1
                                }
                            },
                            $inc: {
                                totalUsageLimit: -1
                            }
                        }
                    );
                }
                res.json({ success: true, redirectUrl: "/home" })
            } else {
                res.json({ success: false, message: "Coupon code not valid" })
            }


        } catch (error) {
            logger.error(`${error.toString()} - [PATH - ${req.method} ${req.originalUrl} ]`)
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },
}

export default couponController;