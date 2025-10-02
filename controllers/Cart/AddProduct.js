import Cart from "../../model/CartModel.js";

export const addProduct = async (req, res) => {
  try {
    const { productId, kind, quantity } = req.body;
    const userId = req.user._id; // user from auth middleware

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // create new cart
      cart = new Cart({
        userId,
        items: [{ productId, quantity, kind }],
      });
    } else {
      // check if item exists
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // add new item
        cart.items.push({ productId, quantity, kind });
      }
    }

    await cart.save();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error adding product to cart",
      error: err.message,
    });
  }
};
