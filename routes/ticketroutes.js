import express from "express";
import { createTicket } from "../controllers/TicketManagement/CreateTicket.js";
import {
  getTicketById,
  getTickets,
} from "../controllers/TicketManagement/GetTickets.js";
import { updateTicket } from "../controllers/TicketManagement/EditTicket.js";
import { deleteTicket } from "../controllers/TicketManagement/DeleteTicket.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.put("/", updateTicket);
router.delete("/", deleteTicket);

export default router;
