import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
		},
		dob: {
			day: { type: Number, required: true },
			month: { type: Number, required: true },
			year: { type: Number, required: true },
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		role: {
			type: String,
			enum: ["student", "astrologer", "admin"], // astrologer is the single admin who manages content
			default: "student",
		},
		profileImage: {
			type: String,
			default: null,
		},
		enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Array of enrolled course IDs
		resetPasswordToken: { type: String },
		resetPasswordExpire: { type: Date },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
