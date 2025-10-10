import { Router } from "express";
import upload from "../middlewares/upload.js";
import { createCourse } from "../controllers/Course/CreateCourse.js";
import { getCourseById, getCourses } from "../controllers/Course/GetCourses.js";
import { getEnrolledCourses } from "../controllers/Course/GetEnrolledCourses.js";
import { editCourse } from "../controllers/Course/EditCourse.js";
import { deleteCourse } from "../controllers/Course/DeleteCourse.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course (Admin only)
 *     description: Create a new course with image and video content
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Vedic Astrology Basics"
 *               description:
 *                 type: string
 *                 example: "Learn the fundamentals of Vedic astrology"
 *               price:
 *                 type: number
 *                 example: 999
 *               originalPrice:
 *                 type: number
 *                 example: 1999
 *               image:
 *                 type: string
 *                 format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "Hindi"]
 *               premium:
 *                 type: boolean
 *                 example: false
 *               duration:
 *                 type: number
 *                 example: 120
 *               whatYouWillLearn:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized - Admin access required
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     description: Retrieve a list of all available courses with optional filters
 *     parameters:
 *       - in: query
 *         name: premium
 *         schema:
 *           type: boolean
 *         description: Filter by premium status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
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

/**
 * @swagger
 * /api/courses/enrolled:
 *   get:
 *     tags: [Courses]
 *     summary: Get enrolled courses
 *     description: Get all courses enrolled by the authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get("/enrolled", authMiddleware, getEnrolledCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID
 *     description: Retrieve detailed information about a specific course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *   put:
 *     tags: [Courses]
 *     summary: Update course (Admin only)
 *     description: Update an existing course with new information
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *   delete:
 *     tags: [Courses]
 *     summary: Delete course (Admin only)
 *     description: Delete a course from the system
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get("/:id", getCourseById);

const uploadCourseAssets = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "videos", maxCount: 20 },
]);

router.put("/edit/:id", adminMiddleware, uploadCourseAssets, editCourse);
router.put("/:id", adminMiddleware, uploadCourseAssets, editCourse);

router.delete("/delete/:id", adminMiddleware, deleteCourse);
router.delete("/:id", adminMiddleware, deleteCourse);

export default router;
