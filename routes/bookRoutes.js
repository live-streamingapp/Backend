import express from "express";
import upload from "../middlewares/upload.js";
import { createBook } from "../controllers/Book/CreateBook.js";
import { getBookById, getBooks } from "../controllers/Book/GetBooks.js";
import { updateBook } from "../controllers/Book/UpdateBook.js";
import { deleteBook } from "../controllers/Book/DeleteBook.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", adminMiddleware, upload.single("file"), createBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.put("/:id", adminMiddleware, upload.single("file"), updateBook);
router.delete("/:id", adminMiddleware, deleteBook);

export default router;
