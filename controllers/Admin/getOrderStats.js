import Order from "../../model/OrderModel.js";

// GET /api/admin/orders/stats
// Returns aggregate stats for orders for admin dashboard
export const getOrderStats = async (req, res) => {
	try {
		// Total number of orders
		const totalOrders = await Order.countDocuments({});

		// Status counts aggregation
		const statusAgg = await Order.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } },
		]);
		const statusCounts = statusAgg.reduce((acc, cur) => {
			if (cur?._id) acc[cur._id] = cur.count;
			return acc;
		}, {});

		const pendingCount = statusCounts["pending"] ?? 0;
		const completedCount = statusCounts["completed"] ?? 0;

		// Total paid revenue
		const revenueAgg = await Order.aggregate([
			{ $match: { paymentStatus: "paid" } },
			{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
		]);
		const paidRevenue = revenueAgg?.[0]?.total ?? 0;

		// Recent orders (include user and basic fields)
		const recentOrders = await Order.find({})
			.populate("user", "name email")
			.sort({ createdAt: -1 })
			.limit(5)
			.lean();

		return res.status(200).json({
			status: true,
			code: 200,
			message: "Order stats fetched successfully",
			data: {
				totalOrders,
				pendingCount,
				completedCount,
				paidRevenue,
				statusCounts,
				recentOrders,
			},
		});
	} catch (error) {
		console.error("Error fetching order stats:", error);
		return res.status(500).json({
			status: false,
			code: 500,
			message: "Failed to fetch order stats",
			error: error.message,
		});
	}
};
