import express from "express";
import { createTicket } from "../controllers/TicketManagement/CreateTicket.js";
import {
	getTicketById,
	getTickets,
} from "../controllers/TicketManagement/GetTickets.js";
import { updateTicket } from "../controllers/TicketManagement/EditTicket.js";
import { deleteTicket } from "../controllers/TicketManagement/DeleteTicket.js";
import upload from "../middlewares/upload.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Students can create tickets (authenticated users only)
router.post("/", authMiddleware, createTicket);

// Admin/Astrologer can view all tickets
router.get("/", adminMiddleware, getTickets);
router.get("/:id", adminMiddleware, getTicketById);

// Admin/Astrologer can update and delete tickets
router.put("/", adminMiddleware, updateTicket);
router.delete("/", adminMiddleware, deleteTicket);

export default router;
