import Cart from "../../model/CartModel.js";

export const removeCartItem = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		const cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Cart not found",
				data: null,
			});
		}

		// Support both itemId (new) and productId (old) for backward compatibility
		cart.items = cart.items.filter((item) => {
			const id = item.itemId ?? item.productId;
			return id && id.toString() !== productId;
		});

		await cart.save();

		res.status(200).json({
			status: true,
			code: 200,
			message: "Cart item removed successfully",
			data: cart,
		});
	} catch (err) {
		console.error("Error removing cart item:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error removing cart item",
			error: err.message,
		});
	}
};
