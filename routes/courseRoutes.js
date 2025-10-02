import { Router } from "express";
import upload from "../middlewares/upload.js";
import { createCourse } from "../controllers/Course/CreateCourse.js";
import { getCourseById, getCourses } from "../controllers/Course/GetCourses.js";
import { editCourse } from "../controllers/Course/EditCourse.js";
import { deleteCourse } from "../controllers/Course/DeleteCourse.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = Router();

router.post(
  "/",
  adminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 20 },
  ]),
  createCourse
);

router.get("/", getCourses);
router.get("/:id", getCourseById);

router.put(
  "/edit/:id",
  adminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 20 },
  ]),
  editCourse
);

router.delete("/delete/:id", adminMiddleware, deleteCourse);

export default router;
