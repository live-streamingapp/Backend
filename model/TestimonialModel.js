import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		to: {
			type: String,
			required: true,
			trim: true,
			default: "Vastu Abhishek",
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		feedback: {
			type: String,
			required: true,
			trim: true,
		},
		image: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "approved",
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		reviewedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// Index for better query performance
TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ createdAt: -1 });

export default mongoose.model("Testimonial", TestimonialSchema);
