import Cart from "../../model/CartModel.js";

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
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

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // remove item if quantity <= 0
        cart.items.splice(itemIndex, 1);
      } else {
        // update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      return res.status(200).json({
        status: true,
        code: 200,
        message: "Cart item updated successfully",
        data: cart,
      });
    }

    res.status(404).json({
      status: false,
      code: 404,
      message: "Item not found in cart",
      data: null,
    });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error updating cart item",
      error: err.message,
    });
  }
};
