import Cart from "../../model/CartModel.js";

export const getProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      cart = { items: [] }; // return empty cart structure
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching cart",
      error: err.message,
    });
  }
};
