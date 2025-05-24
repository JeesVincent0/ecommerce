import logger from "../utils/logger.js"
import Order from "../models/ordersSchema.js";

export const salesReportData = async (startDateRaw, endDateRaw, skip = 0, limit = 1000) => {
    try {
        // Base filter: only delivered orders
        const filter = { orderStatus: 'delivered' };

        // Helper to check valid date string
        const isValidDate = (dateStr) => {
            const d = new Date(dateStr);
            return !isNaN(d.getTime());
        };

        if (
            startDateRaw &&
            endDateRaw &&
            isValidDate(startDateRaw) &&
            isValidDate(endDateRaw)
        ) {
            const startDate = new Date(startDateRaw);
            startDate.setUTCHours(0, 0, 0, 0);

            const endDate = new Date(endDateRaw);
            endDate.setUTCHours(23, 59, 59, 999);

            filter.placedAt = { $gte: startDate, $lte: endDate };
        }

        const totalOrders = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .sort({ placedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(
                'orderId userName placedAt paymentMethod items totalAmount coupon.discountAmount grandTotal orderStatus'
            );

        const summary = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$coupon.discountAmount' },
                    finalAmount: { $sum: '$grandTotal' },
                },
            },
        ]);

        const salesSummary = summary[0] || {
            totalSales: 0,
            totalDiscount: 0,
            finalAmount: 0,
        };

        return {
            totalOrders,
            orders,
            summary: salesSummary,
            dateRange: `${startDateRaw} - ${endDateRaw}`,
        };

    } catch (error) {
        logger.error(`${error.toString()}`)
    }
}