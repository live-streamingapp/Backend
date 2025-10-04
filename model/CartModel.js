import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				refPath: "items.kind",
			},
			kind: {
				type: String,
				required: true,
				enum: ["Product", "Book", "Package", "Course"],
			},
			quantity: { type: Number, default: 1 },
		},
	],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
