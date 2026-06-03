import Product from '../products/product.model.js';
import Order from '../orders/order.model.js';
import Quotation from '../quotations/quotation.model.js';
import { getCache, setCache } from '../../config/redis.js';
import { sendSuccess } from '../../utils/response.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const cacheKey = 'analytics:admin';
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return sendSuccess(res, 200, 'Admin analytics retrieved from cache', cachedData);
    }

    // 1. Core counters
    const [totalProducts, totalOrders, totalQuotations] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Quotation.countDocuments(),
    ]);

    // 2. Total revenue sum (excluding cancelled orders)
    const revenueAggregate = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenue = revenueAggregate[0]?.total || 0;

    // 3. Low stock threshold alert (weight/volume < 1000 base, item < 10 base)
    const lowStockProducts = await Product.find({
      $or: [
        { baseUnit: 'mg', inventoryQuantity: { $lt: 2000000 } }, // < 2kg (2,000,000 mg)
        { baseUnit: 'mL', inventoryQuantity: { $lt: 2000 } }, // < 2L
        { baseUnit: 'item', inventoryQuantity: { $lt: 10 } }, // < 10 items
      ],
      active: true,
    })
      .populate('categoryId', 'name')
      .limit(10);

    // 4. Revenue & Order Trends over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates in trend
    const trendMap = new Map(salesTrend.map(item => [item._id, item]));
    const formattedTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = trendMap.get(dateStr);
      formattedTrend.push({
        date: dateStr,
        revenue: match ? Math.round(match.revenue * 100) / 100 : 0,
        orders: match ? match.orderCount : 0,
      });
    }

    // 5. Category Distribution (total inventory value or product count)
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$categoryId',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$inventoryQuantity' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 1,
          name: '$categoryInfo.name',
          productCount: 1,
          totalStock: 1,
        },
      },
    ]);

    const analyticsData = {
      summary: {
        totalProducts,
        totalOrders,
        totalQuotations,
        revenue: Math.round(revenue * 100) / 100,
        lowStockAlertsCount: lowStockProducts.length,
      },
      lowStockProducts,
      salesTrend: formattedTrend,
      categoryDistribution,
    };

    // Cache analytics for 5 minutes
    await setCache(cacheKey, analyticsData, 300);

    return sendSuccess(res, 200, 'Admin analytics retrieved successfully', analyticsData);
  } catch (error) {
    next(error);
  }
};

export const getSellerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cacheKey = `analytics:seller:${userId}`;
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return sendSuccess(res, 200, 'Seller analytics retrieved from cache', cachedData);
    }

    // Core seller counts
    const [totalOrders, totalQuotations] = await Promise.all([
      Order.countDocuments({ userId }),
      Quotation.countDocuments({ userId }),
    ]);

    // Total spent/sales value
    const spendingAggregate = await Order.aggregate([
      { $match: { userId, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSpent = spendingAggregate[0]?.total || 0;

    // Recent activity list
    const [recentOrders, recentQuotations] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).limit(5).select('orderNumber totalAmount status createdAt'),
      Quotation.find({ userId }).sort({ createdAt: -1 }).limit(5).select('quotationNumber totalAmount status createdAt'),
    ]);

    const analyticsData = {
      summary: {
        totalOrders,
        totalQuotations,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
      recentOrders,
      recentQuotations,
    };

    // Cache seller metrics for 5 minutes
    await setCache(cacheKey, analyticsData, 300);

    return sendSuccess(res, 200, 'Seller analytics retrieved successfully', analyticsData);
  } catch (error) {
    next(error);
  }
};
