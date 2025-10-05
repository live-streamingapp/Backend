import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: false,
		},
		price: {
			type: Number,
			required: true,
		},
		originalPrice: {
			type: Number,
		},
		// Main service type: consultation, package, or standalone
		serviceType: {
			type: String,
			enum: ["consultation", "package", "service"],
			required: true,
			default: "service",
		},
		// Sub-category for consultations and packages (user-defined)
		subCategory: {
			type: String,
			trim: true,
			// Examples: "Vastu for Home", "Numero Package", "Astrology Package", etc.
		},
		category: {
			type: String,
			enum: ["vastu", "astrology", "numerology", "spiritual", "other"],
			default: "other",
		},
		features: [
			{
				type: String,
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
