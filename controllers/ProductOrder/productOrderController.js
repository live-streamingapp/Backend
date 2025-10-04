import ProductOrder from "../../model/ProductOrderModel.js";

// @desc    Get all product orders
// @route   GET /api/product-orders
// @access  Admin
export const getAllProductOrders = async (req, res) => {
	try {
		const { status, customerId, orderId } = req.query;

		// Build filter object
		const filter = {};
		if (status) filter.orderStatus = status;
		if (customerId) filter["customer.customerId"] = customerId;
		if (orderId) filter.orderId = orderId;

		const orders = await ProductOrder.find(filter).sort({ orderDate: -1 });

		res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		});
	} catch (error) {
		console.error("Error fetching product orders:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product orders",
			error: error.message,
		});
	}
};

// @desc    Get single product order by ID
// @route   GET /api/product-orders/:id
// @access  Admin
export const getProductOrderById = async (req, res) => {
	try {
		const order = await ProductOrder.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Product order not found",
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		console.error("Error fetching product order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product order",
			error: error.message,
		});
	}
};

// @desc    Get product order by Order ID
// @route   GET /api/product-orders/order/:orderId
// @access  Admin
export const getProductOrderByOrderId = async (req, res) => {
	try {
		const order = await ProductOrder.findOne({ orderId: req.params.orderId });

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Product order not found",
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error) {
		console.error("Error fetching product order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product order",
			error: error.message,
		});
	}
};

// @desc    Create new product order
// @route   POST /api/product-orders
// @access  Admin
export const createProductOrder = async (req, res) => {
	try {
		// Generate unique order ID if not provided
		if (!req.body.orderId) {
			const lastOrder = await ProductOrder.findOne().sort({
				createdAt: -1,
			});
			const lastOrderNum = lastOrder
				? parseInt(lastOrder.orderId.split("-")[1])
				: 9000;
			req.body.orderId = `ORD-${lastOrderNum + 1}`;
		}

		const order = await ProductOrder.create(req.body);

		res.status(201).json({
			success: true,
			message: "Product order created successfully",
			data: order,
		});
	} catch (error) {
		console.error("Error creating product order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create product order",
			error: error.message,
		});
	}
};

// @desc    Update product order status
// @route   PUT /api/product-orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
	try {
		const { orderStatus, tracking } = req.body;

		const updateData = { orderStatus };
		if (tracking) updateData.tracking = tracking;
		if (orderStatus === "Order Delivered") {
			updateData.deliveryDate = new Date();
		}

		const order = await ProductOrder.findByIdAndUpdate(
			req.params.id,
			updateData,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Product order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Order status updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Error updating order status:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update order status",
			error: error.message,
		});
	}
};

// @desc    Update product order
// @route   PUT /api/product-orders/:id
// @access  Admin
export const updateProductOrder = async (req, res) => {
	try {
		const order = await ProductOrder.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Product order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Product order updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Error updating product order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update product order",
			error: error.message,
		});
	}
};

// @desc    Delete product order
// @route   DELETE /api/product-orders/:id
// @access  Admin
export const deleteProductOrder = async (req, res) => {
	try {
		const order = await ProductOrder.findByIdAndDelete(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Product order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Product order deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product order:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete product order",
			error: error.message,
		});
	}
};

// @desc    Get product order statistics
// @route   GET /api/product-orders/stats
// @access  Admin
export const getProductOrderStats = async (req, res) => {
	try {
		const totalOrders = await ProductOrder.countDocuments();
		const deliveredOrders = await ProductOrder.countDocuments({
			orderStatus: "Order Delivered",
		});
		const shippedOrders = await ProductOrder.countDocuments({
			orderStatus: "Order Shipped",
		});
		const pendingOrders = await ProductOrder.countDocuments({
			orderStatus: "Order Confirmed",
		});

		// Calculate total revenue
		const revenueData = await ProductOrder.aggregate([
			{ $match: { "payment.paymentStatus": "paid" } },
			{ $group: { _id: null, totalRevenue: { $sum: "$payment.amount" } } },
		]);

		const totalRevenue =
			revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

		res.status(200).json({
			success: true,
			data: {
				total: totalOrders,
				delivered: deliveredOrders,
				shipped: shippedOrders,
				pending: pendingOrders,
				totalRevenue,
			},
		});
	} catch (error) {
		console.error("Error fetching product order stats:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product order statistics",
			error: error.message,
		});
	}
};
