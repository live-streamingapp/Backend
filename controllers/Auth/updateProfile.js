import User from "../../model/UserModel.js";

export const updateProfile = async (req, res) => {
	try {
		const userId = req.user.id; // From auth middleware
		const { name, email, phone, dob } = req.body;

		// Find the user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if email is being changed and if it's already taken
		if (email && email !== user.email) {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return res.status(400).json({
					success: false,
					message: "Email is already in use",
				});
			}
		}

		// Update user fields
		if (name) user.name = name;
		if (email) user.email = email;
		if (phone) user.phone = phone;

		// Update DOB if provided
		if (dob) {
			// Handle both object and individual fields
			if (typeof dob === "object") {
				if (dob.day) user.dob.day = parseInt(dob.day);
				if (dob.month) user.dob.month = parseInt(dob.month);
				if (dob.year) user.dob.year = parseInt(dob.year);
			}
		}

		// Handle profile image upload
		if (req.file) {
			// If using Cloudinary or similar service
			user.profileImage = req.file.path; // Adjust based on your upload setup
		}

		await user.save();

		// Return updated user without password
		const updatedUser = await User.findById(userId).select("-password");

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
			error: error.message,
		});
	}
};
