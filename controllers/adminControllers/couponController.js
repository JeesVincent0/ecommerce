import Coupon from "../../models/couponSchema.js"
import logger from '../../utils/logger.js';

const couponController = {

    //@desc get referral coupons 
    //GET /coupon/referral?page
    getCoupons: async (req, res) => {
        try {
            // Extract pagination parameters from query
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;

            // Get total count for pagination info
            const totalCoupons = await Coupon.countDocuments();

            // Get coupons with pagination
            const coupons = await Coupon.find()
                .sort({ createdAt: -1 }) // Sort by newest first (adjust the field as needed)
                .skip(skip)
                .limit(limit);

            // Send response with pagination metadata
            res.json({
                success: true,
                coupons,
                pagination: {
                    totalCoupons,
                    totalPages: Math.ceil(totalCoupons / limit),
                    currentPage: page,
                    hasNextPage: page * limit < totalCoupons,
                    hasPrevPage: page > 1
                }
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc add new coupon
    //POST /coupon/add
    addCoupon: async (req, res) => {
        try {
            const { code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser } = req.body;

            const existingCoupon = await Coupon.findOne({ code })
            if (existingCoupon) throw new Error("This coupon code is already taken")

            const newCoupon = new Coupon({
                code, discountType, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser, totalUsageLimit
            })

            await newCoupon.save();

            res.json({ success: true })

        } catch (error) {
            logger.error('error message', error.message)
            if (error.message === "This coupon code is already taken") {
                res.status(500).json({ success: false, couponUsed: true });
            } else {
                res.status(500).json({ success: false, message: "Something went wrong" });
            }
        }
    },

    //@desc get coupon data for edit coupon form 
    //GET /coupon/edit
    getCoupon: async (req, res) => {
        try {
            const couponId = req.query.couponId;

            const coupon = await Coupon.findOne({ _id: couponId })
            res.json({ success: true, coupon })
        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc save edited coupon data
    // PATCH /coupon/edit
    saveCoupon: async (req, res) => {
        try {
            const { id, code, discountType, totalUsageLimit, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser } = req.body;

            const existingCoupon = await Coupon.findOne({ code, _id: { $ne: id } });
            if (existingCoupon) {
                return res.status(400).json({ success: false, message: "Coupon code already exists." });
            }

            await Coupon.updateOne(
                { _id: id },
                {
                    $set: {
                        code, discountType, totalUsageLimit, discountValue, minPurchase, maxDiscount, startDate, expiryDate, usageLimitPerUser
                    }
                }
            );

            res.json({ success: true })

        } catch (error) {
            logger.error(error.toString())
            res.status(500).json({ success: true, message: "Something went wrong" });
        }
    },

    //@desc block or unblock coupon
    //PATCH /coupon/block
    blockCoupon: async (req, res) => {
        try {
            const { couponId } = req.body;

            if (!couponId) {
                return res.status(400).json({ success: false, message: "Coupon ID is required" });
            }

            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found" });
            }

            // Toggle between 'active' and 'inactive'
            const newStatus = coupon.status === "active" ? "inactive" : "active";

            await Coupon.updateOne({ _id: couponId }, { status: newStatus });

            res.status(200).json({
                success: true,
                message: `Coupon ${newStatus === "inactive" ? "blocked" : "unblocked"} successfully`,
                newStatus
            });
        } catch (error) {
            console.error("Error toggling coupon status:", error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc this controller for search coupons
    //router GET /coupon/search
    searchCoupons: async (req, res) => {
        try {
            const query = req.query.query;

            if (!query) {
                return res.status(400).json({ success: false, message: "Search query is required" });
            }

            // Case-insensitive search on coupon code
            const coupons = await Coupon.find({
                $or: [
                    { code: { $regex: query, $options: 'i' } },
                    { discountType: { $regex: query, $options: 'i' } },
                    { status: { $regex: query, $options: 'i' } }
                ]
            });

            res.json({ success: true, coupons });
        } catch (error) {
            logger.error(error);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    

}

export default couponController;