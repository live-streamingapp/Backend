import mongoose from "mongoose";
import Banner from "../model/BannerModel.js";
import { config } from "dotenv";
import connectDB from "../config/db.js";

config();

const sampleBanners = [
	{
		title: "New Course on Palmistry Available!",
		description:
			"Discover the secrets of palm reading with our comprehensive palmistry course. Learn to interpret life lines, heart lines, and more.",
		buttonText: "Start Your Journey",
		background: "#bb1401",
		image: null,
	},
	{
		title: "Master the Art of Vastu Shastra",
		description:
			"Transform your living space with ancient Vastu principles. Create harmony and prosperity in your home and workplace.",
		buttonText: "Learn Vastu",
		background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		image: null,
	},
	{
		title: "Unlock Your Future with Astrology",
		description:
			"Explore the cosmic influences on your life. Our expert astrologers guide you through personalized birth chart readings.",
		buttonText: "Get Reading",
		background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
		image: null,
	},
	{
		title: "Numerology - Decode Your Numbers",
		description:
			"Understand the power of numbers in your life. Discover your life path number and its significance in shaping your destiny.",
		buttonText: "Calculate Now",
		background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
		image: null,
	},
	{
		title: "Face Reading Masterclass",
		description:
			"Learn to read faces like an open book. Understand personality traits, future prospects, and character through facial features.",
		buttonText: "Join Course",
		background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
		image: null,
	},
];

const seedBanners = async () => {
	try {
		await connectDB();

		// Clear existing banners
		await Banner.deleteMany({});
		console.log("Cleared existing banners");

		// Create new banners
		const createdBanners = await Banner.insertMany(sampleBanners);
		console.log(`Created ${createdBanners.length} sample banners`);

		console.log("Sample banners data:");
		createdBanners.forEach((banner, index) => {
			console.log(`${index + 1}. ${banner.title}`);
			console.log(`   Description: ${banner.description}`);
			console.log(`   Button: ${banner.buttonText}`);
			console.log(`   Background: ${banner.background}`);
			console.log("---");
		});
	} catch (error) {
		console.error("Error seeding banners:", error);
	} finally {
		mongoose.connection.close();
		console.log("Database connection closed");
	}
};

// Run the seed function
seedBanners();
