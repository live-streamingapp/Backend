import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, default: "Learn More" },
    image: { type: String }, // Cloudinary URL
    cloudinary_id: { type: String }, // For updating/deleting
    background: { type: String, default: "#bb1401" }, // hex or gradient string
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
