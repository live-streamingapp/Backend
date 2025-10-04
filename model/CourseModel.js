import mongoose from "mongoose";

const courseContentSchema = new mongoose.Schema({
	title: { type: String, required: true },
	preview: { type: Boolean, default: false },
	video: { type: String },
});

const courseSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		originalPrice: { type: Number },
		image: { type: String },

		// Created by admin (the single astrologer)
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		lastUpdated: { type: String },

		languages: [{ type: String }],
		subtitles: [{ type: String }],

		includedInPlans: { type: Boolean, default: false },
		premium: { type: Boolean, default: false },

		rating: { type: Number, default: 0, min: 0, max: 5 },
		ratingCount: { type: Number, default: 0 },
		learners: { type: Number, default: 0 },

		duration: { type: Number },
		lessons: { type: Number },

		progress: { type: Number, default: 0, min: 0, max: 100 },

		whatYouWillLearn: [{ type: String }],
		relatedTopics: [{ type: String }],
		courseIncludes: [{ type: String }],
		courseContent: [courseContentSchema], // lessons with video
		requirements: [{ type: String }],
		detailedDescription: [{ type: String }],

		// Single instructor reference (the main astrologer)
		instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
	},
	{ timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
