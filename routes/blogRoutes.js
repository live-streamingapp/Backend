import express from "express";
import upload from "../middlewares/upload.js";
import { addBlog } from "../controllers/Blog/AddBlog.js";
import { getBlogById, getBlogs } from "../controllers/Blog/GetBlog.js";
import { editBlog } from "../controllers/Blog/EditBlog.js";
import { deleteBlog } from "../controllers/Blog/DeleteBlog.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Create blog
router.post(
  "/create",
  adminMiddleware,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sectionImages", maxCount: 10 },
  ]),
  addBlog
);

// Get all blogs
router.get("/", getBlogs);

// Get single blog by ID
router.get("/:id", getBlogById);

// Update blog
router.put(
  "/:id",
  adminMiddleware,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "sectionImages", maxCount: 10 },
  ]),
  editBlog
);

// Delete blog
router.delete("/:id", adminMiddleware, deleteBlog);

export default router;
