import User from "../../model/UserModel.js";
import ProductOrder from "../../model/ProductOrderModel.js";

// Get all customers (users who have made purchases)
export const getCustomers = async (req, res) => {
	try {
		// Find all distinct user IDs from orders
		const customerIds = await ProductOrder.find().distinct("customer.userId");

		const customers = await User.find({
			_id: { $in: customerIds },
		}).select("-password");

		res.status(200).json({
			status: true,
			code: 200,
			message: "Customers fetched successfully",
			data: {
				count: customers.length,
				customers,
			},
		});
	} catch (err) {
		console.error("Error fetching customers:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error fetching customers",
			error: err.message,
		});
	}
};

// Get customer by ID with their orders
export const getCustomerById = async (req, res) => {
	try {
		const { id } = req.params;

		const customer = await User.findById(id).select("-password");

		if (!customer) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Customer not found",
			});
		}

		// Get customer's orders
		const orders = await ProductOrder.find({ "customer.userId": id })
			.populate("product.productId")
			.sort({ createdAt: -1 });

		res.status(200).json({
			status: true,
			code: 200,
			message: "Customer details fetched successfully",
			data: {
				customer,
				orders,
				totalOrders: orders.length,
			},
		});
	} catch (err) {
		console.error("Error fetching customer:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error fetching customer details",
			error: err.message,
		});
	}
};

// Update customer details
export const updateCustomer = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		// Don't allow password updates through this endpoint
		delete updates.password;
		delete updates.role;

		const customer = await User.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!customer) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Customer not found",
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Customer updated successfully",
			data: customer,
		});
	} catch (err) {
		console.error("Error updating customer:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error updating customer",
			error: err.message,
		});
	}
};
