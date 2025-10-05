import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },

		languageOptions: [
			{
				language: { type: String, required: true },
				available: { type: Boolean, default: true },
				stock: { type: Number, default: 0 }, // ✅ Only here
				buyLink: { type: String },
			},
		],

		description: { type: String },

		highlights: {
			whyThisBook: { type: String },
			difference: { type: String },
			whoCanBuy: { type: String },
		},

		keyFeatures: [{ feature: { type: String } }],

		targetAudience: [{ type: String }],

		price: { type: Number },
		pages: { type: Number }, // Number of pages in the book
		coverImage: { type: String },
		cloudinaryImageId: { type: String },

		// Created by admin (the single astrologer)
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
