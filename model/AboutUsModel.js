import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const aboutSchema = new mongoose.Schema({
  description: { type: String, required: true },
  services: [{ type: String, required: true }],
  image: { type: String }, // Path/URL of about-us image
  customerCareNumber: { type: String },
  contactEmail: { type: String },
  faqs: [faqSchema],
});

const About = mongoose.model("About", aboutSchema);
export default About;
