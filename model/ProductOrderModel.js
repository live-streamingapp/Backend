import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const productOrderSchema = new Schema(
	{
		orderId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		customer: {
			customerId: { type: String, required: true, trim: true },
			customerName: { type: String, required: true, trim: true },
			phone: { type: String, trim: true },
			email: { type: String, trim: true },
			userId: { type: Types.ObjectId, ref: "User" },
		},
		product: {
			productId: { type: Types.ObjectId, ref: "Book" },
			title: { type: String, required: true, trim: true },
			category: {
				type: String,
				enum: [
					"Gemstones",
					"Rudraksha",
					"Pooja Items",
					"Spiritual Books",
					"Color Gemstone",
					"Other",
				],
			},
			quantity: { type: Number, required: true, default: 1 },
			price: { type: Number, required: true },
			image: { type: String },
		},
		shipping: {
			addressLines: [{ type: String }],
			city: { type: String },
			state: { type: String },
			pincode: { type: String },
			country: { type: String, default: "India" },
		},
		payment: {
			amount: { type: Number, required: true },
			currency: { type: String, default: "INR" },
			paymentMethod: { type: String },
			transactionId: { type: String },
			paymentStatus: {
				type: String,
				enum: ["pending", "paid", "failed", "refunded"],
				default: "paid",
			},
		},
		orderStatus: {
			type: String,
			enum: [
				"Order Placed",
				"Order Confirmed",
				"Order Shipped",
				"Out for Delivery",
				"Order Delivered",
				"Cancelled",
				"Returned",
			],
			default: "Order Confirmed",
		},
		tracking: {
			steps: [
				{
					label: { type: String },
					date: { type: Date },
					completed: { type: Boolean, default: false },
				},
			],
			currentStep: { type: Number, default: 0 },
		},
		orderDate: { type: Date, default: Date.now },
		deliveryDate: { type: Date },
		rating: {
			value: { type: Number, min: 0, max: 5 },
			reviews: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

// Indexes for better query performance
productOrderSchema.index({ orderId: 1 });
productOrderSchema.index({ "customer.customerId": 1 });
productOrderSchema.index({ orderStatus: 1 });
productOrderSchema.index({ orderDate: -1 });

const ProductOrder = model("ProductOrder", productOrderSchema);

export default ProductOrder;
