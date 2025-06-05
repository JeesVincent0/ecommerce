import logger from '../../utils/logger.js';
import referralCoupon from "../../models/referralCouponSchema.js"

const refferalCouponController = {
    //@desc get all referral coupons for list in the admin panel
    // GET /coupon
    getReferralCoupons: async (req, res) => {
        try {
            // Extract pagination parameters from query
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;

            // Get total count for pagination info
            const totalCoupons = await referralCoupon.countDocuments();

            // Get coupons with pagination
            const coupons = await referralCoupon.find()
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

    //@desc Create new referral coupon form submition
    //POST /coupon/referral/add
    addReferralCoupon: async (req, res) => {
        try {
            const { code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays } = req.body;

            const existingCoupon = await referralCoupon.findOne({ code })
            if (existingCoupon) throw new Error("This coupon code is already taken")

            const newCoupon = new referralCoupon({
                code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays
            })

            await newCoupon.save();

            res.json({ success: true })

        } catch (error) {
            logger.error(error.toString())
        }
    },

    //@desc get referral coupon data for edit
    //GET /coupon/referral/edit
    getReferralCoupon: async (req, res) => {
        try {
            const couponId = req.query.couponId;

            const coupon = await referralCoupon.findOne({ _id: couponId })

            res.json({ success: true, coupon })

        } catch (error) {
            logger.error(error)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc save edited referral coupon data
    //PATCH /coupon/referral/edit
    saveReferralCoupon: async (req, res) => {
        try {
            let { id, code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays } = req.body;

            const existingCoupon = await referralCoupon.findOne({ code, _id: { $ne: id } });
            if (existingCoupon) {
                return res.status(400).json({ success: false, message: "Coupon code already exists." });
            }

            if (discountType === "fixed") {
                maxDiscount = 0;
            }

            await referralCoupon.updateOne(
                { _id: id },
                {
                    $set: {
                        code, totalUsageLimit, discountType, discountValue, minPurchase, maxDiscount, offerDays
                    }
                }
            );

            res.json({ success: true })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ success: false, message: "Something went wrong" })
        }
    },

    //@desc bolock and unblock referral coupon
    // PATCH blockReferralCoupon
    blockReferralCoupon: async (req, res) => {
        try {
            const { couponId } = req.body;

            if (!couponId) {
                return res.status(400).json({ success: false, message: "Coupon ID is required" });
            }

            const coupon = await referralCoupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found" });
            }

            // Toggle between 'active' and 'inactive'
            const newStatus = coupon.status === "active" ? "inactive" : "active";

            await referralCoupon.updateOne({ _id: couponId }, { status: newStatus });

            res.status(200).json({
                success: true,
                message: `Coupon ${newStatus === "inactive" ? "blocked" : "unblocked"} successfully`,
                newStatus
            });
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ success: true, message: "Something went wrong" })
        }
    },

    //@desc search referral coupons
    // GET /coupon/referral/search?
    searchReferralCoupons: async (req, res) => {
        try {
            const query = req.query.query;

            if (!query) {
                return res.status(400).json({ success: false, message: "Search query is required" });
            }

            // Case-insensitive search on coupon code
            const coupons = await referralCoupon.find({
                $or: [
                    { code: { $regex: query, $options: 'i' } },
                    { discountType: { $regex: query, $options: 'i' } },
                    { status: { $regex: query, $options: 'i' } }
                ]
            });

            res.json({ success: true, coupons });
        } catch (error) {
            logger.error(error.toString());
            res.status(500).json({ success: true, message: "Something went wrong" })
        }
    },

}

export default refferalCouponController;