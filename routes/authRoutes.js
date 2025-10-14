import express from "express";
import { registerUser } from "../controllers/Auth/register.js";
import { login } from "../controllers/Auth/login.js";
import { verifyOtp } from "../controllers/Auth/verifyOtp.js";
import { resendOtp } from "../controllers/Auth/resendOtp.js";
import { forgotPassword } from "../controllers/Auth/forgotPassword.js";
import { resetPassword } from "../controllers/Auth/resetPassword.js";
import { changePassword } from "../controllers/Auth/changePassword.js";
import { updateProfile } from "../controllers/Auth/updateProfile.js";
import { getAstrologer } from "../controllers/Auth/getAstrologer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: |
 *       Create a new user account with email, phone, and password.
 *       An OTP will be sent to the provided email for verification.
 *
 *       **Password Requirements:**
 *       - Minimum 8 characters
 *       - At least one uppercase letter
 *       - At least one number
 *       - At least one special character (!@#$%^&*)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - dob
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Valid email address
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Contact phone number
 *               dob:
 *                 type: object
 *                 required:
 *                   - day
 *                   - month
 *                   - year
 *                 properties:
 *                   day:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 31
 *                     example: 15
 *                   month:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 12
 *                     example: 8
 *                   year:
 *                     type: number
 *                     minimum: 1900
 *                     maximum: 2024
 *                     example: 1990
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123"
 *                 description: Strong password meeting all requirements
 *               role:
 *                 type: string
 *                 enum: [student, astrologer]
 *                 example: "student"
 *                 description: User role (optional, defaults to student)
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "OTP sent to email. Please verify your email to complete registration."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       400:
 *         description: Bad request - validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "This email is already registered"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify OTP for email verification
 *     description: |
 *       Verify the OTP sent to user's email during registration.
 *       OTP expires after 10 minutes.
 *       Upon successful verification, user account is created and JWT token is set in cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Email address used during registration
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit OTP received via email
 *               token:
 *                 type: string
 *                 description: Optional verification token (for backward compatibility)
 *     responses:
 *       200:
 *         description: OTP verified successfully, user account created
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly; Secure; SameSite=None
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Email verified and registration completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5ec49f1b2c8b1f8c8e8e8"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         role:
 *                           type: string
 *                           example: "student"
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP. Please try again."
 *       404:
 *         description: No pending registration found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No pending registration found for this email. Please register again."
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Resend OTP
 *     description: |
 *       Resend a new OTP to user's email for verification.
 *       Can only be used if there's a pending registration for the email.
 *       New OTP expires after 10 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Email address used during registration
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "OTP resent successfully. Please check your email."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       400:
 *         description: Bad request - email is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       404:
 *         description: No pending registration found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No pending registration found for this email. Please register again."
 *       500:
 *         description: Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to send OTP email. Please try again."
 */
router.post("/resend-otp", resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: |
 *       Authenticate user with email and password.
 *       JWT token is set in HTTP-only cookie for 4 hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Registered email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123"
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=14400
 *             description: JWT token stored in HTTP-only cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ec49f1b2c8b1f8c8e8e8"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       enum: [student, astrologer, admin]
 *                       example: "student"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 *     description: |
 *       Send password reset link to user's email.
 *       The reset token is valid for 1 hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Registered email address
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password reset email sent successfully. Please check your inbox."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: Failed to send email or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to send password reset email. Please try again."
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password
 *     description: |
 *       Reset user password using the reset token received via email.
 *       Token is valid for 1 hour.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password reset successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       400:
 *         description: Invalid or expired token, or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired token"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password
 *     description: |
 *       Change password for authenticated user by verifying old password.
 *       Requires authentication via cookie.
 *
 *       **New Password Requirements:**
 *       - Minimum 8 characters
 *       - At least one uppercase letter
 *       - At least one number
 *       - At least one special character (!@#$%^&*)
 *       - Must be different from old password
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword@123"
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *                 description: New password meeting all requirements
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword@123"
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Bad request - validation error or passwords don't meet requirements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Old password is incorrect"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized - not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.post("/change-password", authMiddleware, changePassword);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     tags: [Authentication]
 *     summary: Update user profile
 *     description: |
 *       Update authenticated user's profile information including name, email, phone, date of birth, and profile image.
 *       Requires authentication via cookie.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *                 description: Updated full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *                 description: Updated email (must be unique)
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Updated phone number
 *               dob:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: number
 *                     example: 15
 *                   month:
 *                     type: number
 *                     example: 8
 *                   year:
 *                     type: number
 *                     example: 1990
 *                 description: Updated date of birth
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (jpg, png, etc.)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ec49f1b2c8b1f8c8e8e8"
 *                     name:
 *                       type: string
 *                       example: "John Doe Updated"
 *                     email:
 *                       type: string
 *                       example: "john.updated@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     dob:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: number
 *                           example: 15
 *                         month:
 *                           type: number
 *                           example: 8
 *                         year:
 *                           type: number
 *                           example: 1990
 *                     role:
 *                       type: string
 *                       example: "student"
 *                     profileImage:
 *                       type: string
 *                       example: "uploads/profile-123.jpg"
 *       400:
 *         description: Bad request - email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is already in use"
 *       401:
 *         description: Unauthorized - not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update profile"
 */
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

/**
 * @swagger
 * /api/auth/astrologer:
 *   get:
 *     tags: [Authentication]
 *     summary: Get all astrologers
 *     description: |
 *       Retrieve all users with role 'astrologer' or 'admin'.
 *       Returns basic information including id, name, email, profile image, and role.
 *     responses:
 *       200:
 *         description: Astrologers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 astrologers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d5ec49f1b2c8b1f8c8e8e8"
 *                       name:
 *                         type: string
 *                         example: "Dr. Sharma"
 *                       email:
 *                         type: string
 *                         example: "sharma@vastuguru.com"
 *                       profileImage:
 *                         type: string
 *                         example: "uploads/astrologer-profile.jpg"
 *                       role:
 *                         type: string
 *                         enum: [astrologer, admin]
 *                         example: "astrologer"
 *       404:
 *         description: No astrologers found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No astrologers found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/astrologer", getAstrologer);

export default router;
