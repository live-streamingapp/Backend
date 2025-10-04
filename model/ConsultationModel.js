import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const consultationSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		customer: {
			customerId: { type: String, required: true, trim: true },
			customerName: { type: String, required: true, trim: true },
			phone: { type: String, required: true, trim: true },
			city: { type: String, required: true, trim: true },
			userId: { type: Types.ObjectId, ref: "User" },
		},
		instructor: {
			name: { type: String, required: true, trim: true },
			instructorId: { type: Types.ObjectId, ref: "Instructor" },
		},
		consultationDetails: {
			date: { type: Date, required: true },
			time: { type: String, required: true },
			mode: {
				type: String,
				enum: ["Online (Zoom)", "Online (Phone)", "In-Person"],
				default: "Online (Zoom)",
			},
			topic: { type: String, required: true, trim: true },
			language: {
				type: String,
				enum: ["Hindi", "English", "Marathi", "Tamil", "Telugu"],
				default: "Hindi",
			},
		},
		pricing: {
			price: { type: Number, required: true },
			currency: { type: String, default: "INR" },
		},
		status: {
			type: String,
			enum: ["pending", "paid", "confirmed", "completed", "cancelled"],
			default: "pending",
		},
		rating: {
			value: { type: Number, min: 0, max: 5, default: 4.9 },
			reviews: { type: Number, default: 0 },
		},
		// Note: assignedAstrologer removed - single astrologer model (always the main instructor)
		notificationSent: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Indexes for better query performance
consultationSchema.index({ "customer.customerId": 1 });
consultationSchema.index({ "instructor.instructorId": 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ "consultationDetails.date": 1 });

const Consultation = model("Consultation", consultationSchema);

export default Consultation;
