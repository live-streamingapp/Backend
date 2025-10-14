import User from "../../model/UserModel.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "All fields are required",
        data: null,
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "New passwords do not match",
        data: null,
      });
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "New password must be different from old password",
        data: null,
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "New password must be at least 8 characters long",
        data: null,
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "New password must contain at least one uppercase letter",
        data: null,
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "New password must contain at least one number",
        data: null,
      });
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message:
          "New password must contain at least one special character (!@#$%^&*)",
        data: null,
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Current password is incorrect",
        data: null,
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Success response
    res.status(200).json({
      status: true,
      code: 200,
      message: "Password changed successfully",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
