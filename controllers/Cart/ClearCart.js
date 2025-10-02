import Cart from "../../model/CartModel.js";

export const clearCart = async (req, res) => {
  try {
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

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error clearing cart",
      error: err.message,
    });
  }
};
