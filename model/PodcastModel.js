import mongoose from "mongoose";

const PodcastSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true }, // YouTube URL
		thumbnail: { type: String }, // optional: auto-generate from YouTube
		description: { type: String },
		category: { type: String, default: "Astrology" },
		tags: [{ type: String }],
	},
	{ timestamps: true }
);

const Podcast = mongoose.model("Podcast", PodcastSchema);
export default Podcast;
