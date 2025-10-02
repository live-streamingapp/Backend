import express from "express";

import { addProduct } from "../controllers/Cart/AddProduct.js";
import { clearCart } from "../controllers/Cart/ClearCart.js";
import { getProducts } from "../controllers/Cart/GetProducts.js";
import { removeCartItem } from "../controllers/Cart/RemoveCartItem.js";
import { updateCartItem } from "../controllers/Cart/UpdateCartItem.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addProduct);
router.get("/", authMiddleware, getProducts);
router.put("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

export default router;
