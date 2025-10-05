import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		items: [
			{
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					refPath: "items.itemType",
				},
				itemType: {
					type: String,
					required: true,
					enum: ["Course", "Book", "Consultation", "Service"],
				},
				quantity: { type: Number, default: 1 },
				// Store basic info for quick access
				title: String,
				price: Number,
				image: String,
				// Optional: for scheduled services/consultations
				scheduledDate: Date,
				scheduledTime: String,
				additionalInfo: mongoose.Schema.Types.Mixed,
			},
		],
	},
	{ timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
