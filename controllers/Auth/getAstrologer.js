import User from "../../model/UserModel.js";

export const getAstrologer = async (req, res) => {
	try {
		// Find all users with role 'astrologer' or 'admin'
		const astrologers = await User.find({
			role: { $in: ["astrologer", "admin"] },
		}).select("_id name email profileImage role");

		if (!astrologers || astrologers.length === 0) {
			return res.status(404).json({ message: "No astrologers found" });
		}

		return res.status(200).json({
			success: true,
			astrologers,
		});
	} catch (error) {
		console.error("Error fetching astrologers:", error);
		return res.status(500).json({ message: "Server error" });
	}
};
