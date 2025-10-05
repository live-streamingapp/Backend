import Order from "../../model/OrderModel.js";

export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminNotes, trackingNumber } = req.body;

		const validStatuses = [
			"pending",
			"declined",
			"accepted",
			"completed",
			"cancelled",
		];

		if (status && !validStatuses.includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status",
			});
		}

		const updateData = {};
		if (status) updateData.status = status;
		if (adminNotes) updateData.adminNotes = adminNotes;
		if (trackingNumber) updateData.trackingNumber = trackingNumber;

		// Add to status history
		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		if (status) {
			order.statusHistory.push({
				status,
				updatedBy: req.user._id,
				timestamp: new Date(),
				notes: adminNotes,
			});
		}

		if (status === "completed") {
			updateData.deliveredAt = new Date();
		}

		Object.assign(order, updateData);
		await order.save();

		res.status(200).json({
			success: true,
			message: "Order updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Update order status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update order",
			error: error.message,
		});
	}
};

export const updatePaymentStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { paymentStatus, transactionId } = req.body;

		const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

		if (!validPaymentStatuses.includes(paymentStatus)) {
			return res.status(400).json({
				success: false,
				message: "Invalid payment status",
			});
		}

		const updateData = { paymentStatus };
		if (transactionId) updateData.transactionId = transactionId;
		if (paymentStatus === "paid") updateData.paidAt = new Date();

		const order = await Order.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Payment status updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Update payment status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update payment status",
			error: error.message,
		});
	}
};
