import express from "express";
import { adminLogin } from "../controllers/Admin/adminLogin.js";
import { getUsers } from "../controllers/Admin/getUsers.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", adminMiddleware, getUsers);

export default router;
