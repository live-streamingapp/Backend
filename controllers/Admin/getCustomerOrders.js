import Order from "../../model/OrderModel.js";

// Get all orders for customer management view
export const getCustomerOrders = async (req, res) => {
	try {
		const { customerId } = req.query;

		const filter = customerId
			? { $or: [{ user: customerId }, { userId: customerId }] }
			: {};

		const orders = await Order.find(filter)
			.populate({
				path: "user",
				select: "name email phone",
			})
			.sort({ createdAt: -1 });

		res.status(200).json({
			status: true,
			code: 200,
			message: "Customer orders fetched successfully",
			data: {
				orders,
				count: orders.length,
			},
		});
	} catch (err) {
		console.error("Error fetching customer orders:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error fetching customer orders",
			error: err.message,
		});
	}
};
