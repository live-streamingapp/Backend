// DEPRECATED: This legacy seeder is disabled. Use exportStaticData/importStaticData instead.
if (process.env.ALLOW_LEGACY_SEED !== "true") {
	console.error(
		"[DEPRECATED] scripts/seedTestimonials.js is disabled. Use export:static/import:static."
	);
	process.exit(1);
}

import mongoose from "mongoose";
import Testimonial from "../model/TestimonialModel.js";
import dotenv from "dotenv";

dotenv.config();

const testimonials = [
	{
		name: "Priya Sharma",
		to: "Vastu Abhishek",
		rating: 5,
		feedback:
			"Amazing consultation! The predictions were very accurate and the remedies suggested have really helped improve my life. I'm extremely satisfied with the service and would definitely recommend to everyone.",
		status: "approved",
	},
	{
		name: "Rajesh Kumar",
		to: "Vastu Abhishek",
		rating: 5,
		feedback:
			"The vastu consultation for my new office was incredible. After implementing the suggested changes, I've seen significant improvement in my business. Thank you so much!",
		status: "approved",
	},
	{
		name: "Anita Desai",
		to: "Vastu Abhishek",
		rating: 4,
		feedback:
			"Very insightful numerology reading. The analysis of my name and birth date was detailed and helpful. The suggestions for career growth were particularly valuable.",
		status: "approved",
	},
	{
		name: "Vikram Singh",
		to: "Vastu Abhishek",
		rating: 5,
		feedback:
			"Excellent marriage compatibility analysis. The detailed report helped us understand each other better and strengthen our relationship. Highly professional service!",
		status: "approved",
	},
	{
		name: "Lakshmi Nair",
		to: "Vastu Abhishek",
		rating: 5,
		feedback:
			"The vastu analysis of my home was very thorough. After making the recommended changes, there's been a positive shift in the energy of the house. Family harmony has improved significantly.",
		status: "approved",
	},
	{
		name: "Ravi Patel",
		to: "Vastu Abhishek",
		rating: 4,
		feedback:
			"Good consultation session. The gemstone recommendations have been helpful. The astrologer was patient and explained everything clearly.",
		status: "approved",
	},
	{
		name: "Deepika Agarwal",
		to: "Vastu Abhishek",
		rating: 5,
		feedback:
			"The career guidance based on my birth chart was spot-on. I made the job change as suggested and it has been the best decision of my life. Thank you!",
		status: "approved",
	},
	{
		name: "Manish Gupta",
		to: "Vastu Abhishek",
		rating: 4,
		feedback:
			"The consultation was comprehensive and professional. The remedies suggested have started showing positive results. Very satisfied with the service.",
		status: "approved",
	},
];

const seedTestimonials = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		// Clear existing testimonials
		await Testimonial.deleteMany({});
		console.log("Cleared existing testimonials");

		// Insert sample testimonials
		const insertedTestimonials = await Testimonial.insertMany(testimonials);
		console.log(`Inserted ${insertedTestimonials.length} testimonials`);

		console.log("\nSeed data created successfully!");
		console.log(
			"All testimonials are approved and ready for display:",
			insertedTestimonials.length
		);
	} catch (error) {
		console.error("Error seeding testimonials:", error);
	} finally {
		await mongoose.connection.close();
		console.log("Database connection closed");
	}
};

seedTestimonials();
