import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// ============================================
// GET DASHBOARD STATS
// ============================================
export const getDashboardStats = handleAsyncError(async (req, res, next) => {
  try {
    // Нийт тоо
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // Нийт борлуулалт
    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach((order) => {
      totalRevenue += order.totalPrice;
    });

    // Захиалгын статусын хуваарилалт
    const processingOrders = await Order.countDocuments({
      orderStatus: "Processing",
    });
    const shippedOrders = await Order.countDocuments({
      orderStatus: "Shipped",
    });
    const onTheWayOrders = await Order.countDocuments({
      orderStatus: "On The Way",
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "Cancelled",
    });

    // Сүүлийн 7 хоногийн борлуулалт
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesLast7Days = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Сүүлийн 30 хоногийн борлуулалт
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesLast30Days = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Хамгийн их борлуулагдсан 5 бүтээгдэхүүн
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          image: { $first: "$orderItems.image" },
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Ангилалаар борлуулалт
    const categorySales = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Сүүлийн 5 захиалга
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    // Сүүлийн 5 хэрэглэгч
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email avatar role createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
      },
      orderStatus: {
        processing: processingOrders,
        shipped: shippedOrders,
        onTheWay: onTheWayOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      salesLast7Days,
      salesLast30Days,
      topProducts,
      categorySales,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    console.error("❌ Analytics error:", error.message);
    return next(
      new HandleError(
        `Analytics error: ${error.message || "Unknown error"}`,
        500
      )
    );
  }
});