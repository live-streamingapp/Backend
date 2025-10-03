import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const studentBookingSchema = new Schema(
	{
		student: { type: Types.ObjectId, ref: "User", required: true },
		course: { type: Types.ObjectId, ref: "Course", required: true },
		sessionDate: { type: Date, required: true },
		sessionTime: { type: String, required: true },
		astrologerName: { type: String, required: true, trim: true },
		paymentAmount: { type: Number, required: true },
		payoutAmount: { type: Number, required: true },
		paymentStatus: {
			type: String,
			enum: ["Paid", "Pending", "Failed"],
			default: "Paid",
		},
		avatar: { type: String },
	},
	{ timestamps: true }
);

const StudentBooking = model("StudentBooking", studentBookingSchema);

export default StudentBooking;
