import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
	subheading: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	images: [{ type: String }],
	cloudinary_image_ids: [{ type: String }],
});

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		tags: [{ type: String }],
		author: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now(),
		},
		mainImage: {
			type: String,
		},
		cloudinary_main_image_id: {
			type: String,
		},
		description: {
			type: String,
			required: true,
		},
		videoUrl: {
			type: String,
		},
		sections: {
			type: [sectionSchema],
		},
	},
	{ timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
