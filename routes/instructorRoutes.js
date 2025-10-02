import express from "express";
import {
  createInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
} from "../controllers/Instructor/Instructor.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", adminMiddleware, createInstructor);
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);
router.put("/:id", adminMiddleware, updateInstructor);
router.delete("/:id", adminMiddleware, deleteInstructor);

export default router;
