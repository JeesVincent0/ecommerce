import Order from "../models/ordersSchema.js";

export const salesReportData = async (startDateRaw, endDateRaw, skip = 0, limit = 1000) => {
    try {
        const filter = { orderStatus: 'delivered' };

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

        const rawOrders = await Order.find(filter)
            .sort({ placedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(
                'orderId userName placedAt paymentMethod items totalAmount coupon.discountAmount grandTotal orderStatus'
            );

        // Calculate totalItems and totalMRP per order
        const orders = rawOrders.map(order => {
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalMRP = order.items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

            return {
                ...order._doc,
                totalItems,
                totalMRP
            };
        });

        // Summary including totalMRP
        const summary = await Order.aggregate([
            { $match: filter },
            { $unwind: '$items' },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$coupon.discountAmount' },
                    finalAmount: { $sum: '$grandTotal' },
                    totalMRP: {
                        $sum: {
                            $multiply: ['$items.productPrice', '$items.quantity']
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalDiscount: 1,
                    finalAmount: 1,
                    totalMRP: 1
                }
            }
        ]);

        const salesSummary = summary[0] || {
            totalSales: 0,
            totalDiscount: 0,
            finalAmount: 0,
            totalMRP: 0
        };

        return {
            totalOrders,
            orders,
            summary: salesSummary,
            dateRange: `${startDateRaw} - ${endDateRaw}`,
        };

    } catch (error) {
        console.error(error.toString());
    }
};