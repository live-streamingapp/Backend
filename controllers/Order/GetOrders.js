import Order from "../../model/OrderModel.js";

export const getOrders = async (req, res) => {
	try {
		const {
			status,
			itemType,
			paymentStatus,
			page = 1,
			limit = 10,
			userId,
		} = req.query;

		const filter = {};

		// If user is student, only show their orders
		if (req.user.role === "student") {
			filter.user = req.user._id;
		}

		// Admin can filter by userId
		if (userId && req.user.role === "admin") {
			filter.user = userId;
		}

		if (status) filter.status = status;
		if (paymentStatus) filter.paymentStatus = paymentStatus;

		// Filter by item type
		if (itemType) {
			filter["items.itemType"] = itemType;
		}

		const skip = (Number(page) - 1) * Number(limit);

		const orders = await Order.find(filter)
			.populate("user", "name email phone")
			.populate({
				path: "items.itemId",
				select: "title name image price author",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));

		const total = await Order.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: orders,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		console.error("Get orders error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders",
			error: error.message,
		});
	}
};

export const getOrderById = async (req, res) => {
	try {
		const { id } = req.params;

		const order = await Order.findById(id)
			.populate("user", "name email phone dob")
			.populate({
				path: "items.itemId",
				select: "title name image price description author",
			})
			.populate("statusHistory.updatedBy", "name email");

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Check if user has permission to view this order
		if (
			req.user.role === "student" &&
			order.user._id.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({
				success: false,
				message: "Unauthorized to view this order",
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		console.error("Get order by ID error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch order",
			error: error.message,
		});
	}
};

export const getMyOrders = async (req, res) => {
	try {
		const userId = req.user._id;
		const { status, itemType, page = 1, limit = 10 } = req.query;

		const filter = { user: userId };

		if (status) filter.status = status;
		if (itemType) filter["items.itemType"] = itemType;

		const skip = (Number(page) - 1) * Number(limit);

		const orders = await Order.find(filter)
			.populate({
				path: "items.itemId",
				select: "title name image price",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));

		const total = await Order.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: orders,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		console.error("Get my orders error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders",
			error: error.message,
		});
	}
};
