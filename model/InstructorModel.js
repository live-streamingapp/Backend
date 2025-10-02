import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: String },
    comment: { type: String },
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String },
    specialties: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    students: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Instructor = mongoose.model("Instructor", instructorSchema);
export default Instructor;
