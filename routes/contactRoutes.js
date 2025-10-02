import express from "express";
import { createContact } from "../controllers/Contact/CreateContact.js";
import { getQueries } from "../controllers/Contact/GetQueries.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", adminMiddleware, getQueries);

export default router;
