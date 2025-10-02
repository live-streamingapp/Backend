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
    coverImage: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
