import process from "process";
import logger from '../../utils/logger.js';
import Order from "../../models/ordersSchema.js";
import Product from "../../models/productSchema.js";

const dashBoardController = {

    //@desc render admin home
    //GET /adminhome
    getAdminHome: (req, res) => {
        try {
            res.render("admin/adminMainLayout")
        } catch (error) {
            logger.error(error)
        }
    },

    //@desc get data for admin dashboard
    //rouer GET /dashboard?startDate=&endDate=
    dashBoardData: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate) : new Date('2000-01-01');
            start.setUTCHours(0, 0, 0, 0);

            const end = endDate ? new Date(endDate) : new Date();
            end.setUTCHours(23, 59, 59, 999);

            const orders = await Order.find({
                placedAt: { $gte: start, $lte: end },
                orderPlaced: true
            }).populate('items.productId');

            let delivered = 0;
            let returned = 0;
            let codCount = 0;
            let razorpayCount = 0;

            let totalMRP = 0;
            let totalRevenue = 0;
            let productDiscount = 0;
            let couponDiscount = 0;
            let proportionalCouponDiscount = 0;

            for (const order of orders) {
                if (order.paymentMethod === 'cod') codCount++;
                if (order.paymentMethod === 'razorpay') razorpayCount++;

                // Calculate total delivered revenue per order
                const deliveredItems = order.items.filter(item => item.orderStatus === 'delivered');
                const totalDeliveredRevenue = deliveredItems.reduce((sum, item) => (
                    sum + item.priceAtPurchase * item.quantity
                ), 0);

                for (const item of order.items) {
                    if (item.orderStatus === 'delivered') delivered++;
                    if (item.orderStatus === 'returned') returned++;

                    const itemMRP = item.productPrice * item.quantity;
                    const itemRevenue = item.priceAtPurchase * item.quantity;
                    const itemProductDiscount = (item.productPrice - item.priceAtPurchase) * item.quantity;

                    totalMRP += itemMRP;
                    totalRevenue += itemRevenue;
                    productDiscount += itemProductDiscount;

                    // Add proportional coupon discount only for delivered items
                    if (item.orderStatus === 'delivered' && order.coupon?.discountAmount && totalDeliveredRevenue > 0) {
                        const proportion = itemRevenue / totalDeliveredRevenue;
                        const proportionalDiscount = proportion * order.coupon.discountAmount;
                        proportionalCouponDiscount += proportionalDiscount;
                    }
                }

                // Add full coupon discount to total discount
                if (order.coupon?.discountAmount) {
                    couponDiscount += order.coupon.discountAmount;
                }
            }

            const totalItems = delivered + returned;

            const deliveryReturnRatio = {
                delivered,
                returned,
                deliveredPercentage: totalItems ? ((delivered / totalItems) * 100).toFixed(2) : 0,
                returnedPercentage: totalItems ? ((returned / totalItems) * 100).toFixed(2) : 0
            };

            const paymentMethodRatio = {
                cod: codCount,
                razorpay: razorpayCount,
                codPercentage: (codCount + razorpayCount) ? ((codCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0,
                razorpayPercentage: (codCount + razorpayCount) ? ((razorpayCount / (codCount + razorpayCount)) * 100).toFixed(2) : 0
            };

            const totalDiscount = productDiscount + couponDiscount;
            const finalAmount = totalDiscount - proportionalCouponDiscount;

            const pricingStats = {
                totalMRP: +totalMRP.toFixed(2),
                totalRevenue: +totalRevenue.toFixed(2),
                productDiscount: +productDiscount.toFixed(2),
                couponDiscount: +couponDiscount.toFixed(2),
                totalDiscount: +totalDiscount.toFixed(2),
                proportionalCouponDiscount: +proportionalCouponDiscount.toFixed(2),
                finalAmount: +finalAmount.toFixed(2)
            };

            // Top 10 Best-Selling Products
            const topProducts = await Order.aggregate([
                {
                    $match: {
                        placedAt: { $gte: start, $lte: end },
                        orderPlaced: true,
                        'items.orderStatus': 'delivered'
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.orderStatus': 'delivered' } },
                {
                    $group: {
                        _id: '$items.productId',
                        totalSold: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                { $unwind: '$productInfo' },
                {
                    $project: {
                        productId: '$_id',
                        product_name: '$productInfo.product_name',
                        discount_price: '$productInfo.discount_price',
                        mrp: '$productInfo.mrp',
                        ratings: '$productInfo.ratings',
                        image: { $arrayElemAt: ['$productInfo.images', 0] },
                        totalSold: 1
                    }
                }
            ]);

            // Top Brands
            const topBrands = await Order.aggregate([
                {
                    $match: {
                        placedAt: { $gte: start, $lte: end },
                        orderPlaced: true,
                        'items.orderStatus': 'delivered'
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.orderStatus': 'delivered' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                { $unwind: '$productInfo' },
                {
                    $group: {
                        _id: '$productInfo.brand',
                        salesCount: { $sum: '$items.quantity' },
                        productSet: { $addToSet: '$items.productId' },
                        revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } }
                    }
                },
                {
                    $project: {
                        brand: '$_id',
                        salesCount: 1,
                        productCount: { $size: '$productSet' },
                        revenue: 1
                    }
                },
                { $sort: { salesCount: -1 } },
                { $limit: 10 }
            ]);

            // Top Categories
            const topCategoriesRaw = await Order.aggregate([
                {
                    $match: {
                        placedAt: { $gte: start, $lte: end },
                        orderPlaced: true,
                        'items.orderStatus': 'delivered'
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.orderStatus': 'delivered' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'productInfo'
                    }
                },
                { $unwind: '$productInfo' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'productInfo.category_id',
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                { $unwind: '$categoryInfo' },
                {
                    $group: {
                        _id: '$categoryInfo._id',
                        name: { $first: '$categoryInfo.name' },
                        totalUnitsSold: { $sum: '$items.quantity' },
                        totalRevenue: {
                            $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] }
                        }
                    }
                },
                { $sort: { totalUnitsSold: -1 } },
                { $limit: 10 }
            ]);

            const topCategories = await Promise.all(
                topCategoriesRaw.map(async (cat) => {
                    const productCount = await Product.countDocuments({ category_id: cat._id });
                    return {
                        categoryId: cat._id,
                        name: cat.name,
                        totalUnitsSold: cat.totalUnitsSold,
                        totalRevenue: cat.totalRevenue,
                        totalProducts: productCount
                    };
                })
            );

            res.json({
                success: true,
                deliveryReturnRatio,
                paymentMethodRatio,
                pricingStats,
                topProducts,
                topCategories,
                topBrands
            });

        } catch (error) {
            logger.error(`${error.toString()} - [PATH - ${req.method} ${req.originalUrl} ]`);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    },

    //@desc get sales data for admin dashboard
    //router GET /sales-chart-data
    getSalesChartData: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            // Set date range with proper UTC handling
            const start = startDate ? new Date(startDate) : new Date('2000-01-01');
            start.setUTCHours(0, 0, 0, 0);

            const end = endDate ? new Date(endDate) : new Date();
            end.setUTCHours(23, 59, 59, 999);

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Helper function to determine grouping strategy
            const getGroupingStrategy = (diffDays) => {
                if (diffDays <= 7) {
                    return {
                        groupBy: { $dayOfMonth: "$placedAt" },
                        dateFormat: "%Y-%m-%d"
                    };
                } else if (diffDays <= 31) {
                    return {
                        groupBy: { $dayOfMonth: "$placedAt" },
                        dateFormat: "%Y-%m-%d"
                    };
                } else if (diffDays <= 365) {
                    return {
                        groupBy: { $month: "$placedAt" },
                        dateFormat: "%Y-%m"
                    };
                } else {
                    return {
                        groupBy: { $year: "$placedAt" },
                        dateFormat: "%Y"
                    };
                }
            };

            const { dateFormat } = getGroupingStrategy(diffDays);

            // Get sales data with proper item-level status checking
            const salesData = await Order.aggregate([
                {
                    $match: {
                        placedAt: { $gte: start, $lte: end },
                        orderPlaced: true
                    }
                },
                {
                    $unwind: "$items"
                },
                {
                    $match: {
                        "items.orderStatus": "delivered"
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: "$placedAt" } },
                        totalSales: {
                            $sum: {
                                $multiply: ["$items.quantity", "$items.priceAtPurchase"]
                            }
                        },
                        orderCount: { $addToSet: "$_id" },
                        itemCount: { $sum: "$items.quantity" }
                    }
                },
                {
                    $addFields: {
                        orderCount: { $size: "$orderCount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Helper function to fill missing periods with zero values
            const fillMissingPeriods = (data, start, end, diffDays) => {
                const filledData = [];
                const dataMap = new Map(data.map(item => [item._id, item]));

                if (diffDays <= 31) {
                    // Fill daily data
                    const current = new Date(start);
                    while (current <= end) {
                        const dateStr = current.toISOString().split('T')[0];
                        filledData.push(dataMap.get(dateStr) || {
                            _id: dateStr,
                            totalSales: 0,
                            orderCount: 0,
                            itemCount: 0
                        });
                        current.setDate(current.getDate() + 1);
                    }
                } else if (diffDays <= 365) {
                    // Fill monthly data
                    const current = new Date(start.getFullYear(), start.getMonth(), 1);
                    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

                    while (current <= endMonth) {
                        const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                        filledData.push(dataMap.get(monthStr) || {
                            _id: monthStr,
                            totalSales: 0,
                            orderCount: 0,
                            itemCount: 0
                        });
                        current.setMonth(current.getMonth() + 1);
                    }
                } else {
                    // Fill yearly data
                    const startYear = start.getFullYear();
                    const endYear = end.getFullYear();

                    for (let year = startYear; year <= endYear; year++) {
                        const yearStr = year.toString();
                        filledData.push(dataMap.get(yearStr) || {
                            _id: yearStr,
                            totalSales: 0,
                            orderCount: 0,
                            itemCount: 0
                        });
                    }
                }

                return filledData;
            };

            // Helper function to format labels for display
            const formatLabel = (dateStr, diffDays) => {
                try {
                    if (diffDays <= 7) {
                        // Show day name for weekly view (e.g., "Mon, Jan 15")
                        const date = new Date(dateStr + 'T00:00:00.000Z');
                        return date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'UTC'
                        });
                    } else if (diffDays <= 31) {
                        // Show month day for monthly view (e.g., "Jan 15")
                        const date = new Date(dateStr + 'T00:00:00.000Z');
                        return date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'UTC'
                        });
                    } else if (diffDays <= 365) {
                        // Show month year for yearly view (e.g., "Jan 2024")
                        const [year, month] = dateStr.split('-');
                        const date = new Date(year, month - 1, 1);
                        return date.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        });
                    } else {
                        // Show year for multi-year view (e.g., "2024")
                        return dateStr;
                    }
                } catch (error) {
                    console.error('Date formatting error:', error);
                    return dateStr; // fallback to raw string
                }
            };

            // Helper function to get period type for summary
            const getPeriodType = (diffDays) => {
                if (diffDays <= 7) return 'daily-week';
                if (diffDays <= 31) return 'daily-month';
                if (diffDays <= 365) return 'monthly';
                return 'yearly';
            };

            // Fill in missing dates/periods with zero values
            const filledData = fillMissingPeriods(salesData, start, end, diffDays);

            // Format data for chart
            const labels = filledData.map(item => formatLabel(item._id, diffDays));
            const sales = filledData.map(item => item.totalSales);

            // Calculate summary statistics
            const totalRevenue = sales.reduce((sum, amount) => sum + amount, 0);
            const totalOrders = filledData.reduce((sum, item) => sum + (item.orderCount || 0), 0);
            const totalItems = filledData.reduce((sum, item) => sum + (item.itemCount || 0), 0);
            const averageSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Return data in your preferred format
            res.json({
                success: true,
                labels,
                sales,
                // Additional data for enhanced functionality
                summary: {
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalOrders,
                    totalItems,
                    averageSale: Math.round(averageSale * 100) / 100,
                    dateRange: {
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                    },
                    period: getPeriodType(diffDays)
                },
                chartData: filledData
            });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                success: false,
                message: "Server error",
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    },

}

export default dashBoardController;