import Order from "../models/ordersSchema.js";

export const salesReportData = async (startDateRaw, endDateRaw, skip = 0, limit = 1000) => {
  try {
    const isValidDate = (dateStr) => !isNaN(new Date(dateStr).getTime());

    const dateFilter = {};
    if (startDateRaw && endDateRaw && isValidDate(startDateRaw) && isValidDate(endDateRaw)) {
      const startDate = new Date(startDateRaw);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(endDateRaw);
      endDate.setUTCHours(23, 59, 59, 999);

      dateFilter.placedAt = { $gte: startDate, $lte: endDate };
    }

    const baseFilter = {
      ...dateFilter,
      orderPlaced: true,
      items: { $elemMatch: { orderStatus: 'delivered' } }
    };

    const totalOrders = await Order.countDocuments(baseFilter);

    const rawOrders = await Order.find(baseFilter)
      .sort({ placedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('orderId userName placedAt paymentMethod items totalAmount coupon.discountAmount grandTotal');

    let totalSales = 0;
    let totalProductDiscount = 0;
    let totalProportionalDiscount = 0;
    let totalMRPSum = 0;
    let totalOfferSum = 0;

    const orders = rawOrders.map(order => {
      const deliveredItems = order.items.filter(item => item.orderStatus === 'delivered');
      const deliveredQty = deliveredItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

      const couponDiscount = order?.coupon?.discountAmount || 0;
      const perUnitCoupon = totalQty > 0 ? couponDiscount / totalQty : 0;

      let orderMRP = 0;
      let orderFinalAmount = 0;
      let orderProductDiscount = 0;
      let orderProportionalDiscount = 0;

      deliveredItems.forEach(item => {
        const itemMRP = item.productPrice * item.quantity;
        const itemFinal = item.priceAtPurchase * item.quantity;

        const itemDiscount = (item.productPrice - item.priceAtPurchase) * item.quantity;
        const itemPropDiscount = perUnitCoupon * item.quantity;

        orderMRP += itemMRP;
        orderFinalAmount += itemFinal;
        orderProductDiscount += itemDiscount;
        orderProportionalDiscount += itemPropDiscount;
      });

      totalSales += orderMRP;
      totalProductDiscount += orderProductDiscount;
      totalProportionalDiscount += orderProportionalDiscount;
      totalMRPSum += orderMRP;
      totalOfferSum += (orderMRP - orderFinalAmount);

      return {
        ...order._doc,
        totalItems: deliveredQty,
        totalMRP: +orderMRP.toFixed(2),
        finalAmount: +orderFinalAmount.toFixed(2),
        totalDiscount: +orderProductDiscount.toFixed(2),
        proportionalDiscount: +orderProportionalDiscount.toFixed(2)
      };
    });

    // Now compute finalAmount using: totalMRP - productDiscount - couponDiscount
    const computedFinalAmount = totalMRPSum - totalProductDiscount - totalProportionalDiscount;

    const summary = {
      totalSales: +totalSales.toFixed(2),
      finalAmount: +computedFinalAmount.toFixed(2),                      // Correct logic here
      totalDiscount: +totalProductDiscount.toFixed(2),
      proportionalDiscount: +totalProportionalDiscount.toFixed(2),
      totalMRP: +totalMRPSum.toFixed(2),
      totalOffer: +totalOfferSum.toFixed(2)
    };

    return {
      totalOrders,
      orders,
      summary,
      dateRange: `${startDateRaw} - ${endDateRaw}`
    };

  } catch (error) {
    console.error('Sales Report Error:', error.message);
    return {
      totalOrders: 0,
      orders: [],
      summary: {
        totalSales: 0,
        finalAmount: 0,
        totalDiscount: 0,
        proportionalDiscount: 0,
        totalMRP: 0,
        totalOffer: 0
      },
      dateRange: `${startDateRaw} - ${endDateRaw}`
    };
  }
};
