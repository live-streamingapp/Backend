import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../model/ProductModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const sampleProducts = [
	{
		title: "7 Mukhi Rudraksha",
		description:
			"Seven-faced Rudraksha bead brings wealth, good health and prosperity. Blessed by Goddess Lakshmi.",
		category: "Rudraksha",
		price: 1299,
		quantity: 25,
		productCode: "QRD-9845",
		images: [
			{
				url: "/images/SevenMukhiRudraksh.png",
				alt: "7 Mukhi Rudraksha",
			},
		],
		rating: {
			average: 4.9,
			count: 560,
		},
		specifications: new Map([
			["Origin", "Nepal"],
			["Size", "15-18mm"],
			["Certification", "Lab Certified"],
		]),
		isActive: true,
		isFeatured: true,
		tags: ["rudraksha", "spiritual", "lakshmi"],
	},
	{
		title: "Blue Sapphire (Neelam)",
		description:
			"Natural Blue Sapphire gemstone for Saturn. Brings success, discipline and removes obstacles.",
		category: "Gemstones",
		price: 8999,
		quantity: 15,
		productCode: "GEM-5421",
		images: [
			{
				url: "/images/ColorGemstone.png",
				alt: "Blue Sapphire",
			},
		],
		rating: {
			average: 4.8,
			count: 320,
		},
		specifications: new Map([
			["Weight", "5 Carats"],
			["Origin", "Sri Lanka"],
			["Certification", "Gemological Certificate"],
		]),
		isActive: true,
		isFeatured: true,
		tags: ["gemstone", "sapphire", "saturn", "neelam"],
	},
	{
		title: "Ruby (Manik)",
		description:
			"Natural Ruby gemstone for Sun. Enhances leadership, confidence and vitality.",
		category: "Gemstones",
		price: 12999,
		quantity: 10,
		productCode: "GEM-5422",
		images: [
			{
				url: "/images/ColorGemstone.png",
				alt: "Ruby Gemstone",
			},
		],
		rating: {
			average: 4.7,
			count: 280,
		},
		specifications: new Map([
			["Weight", "4 Carats"],
			["Origin", "Myanmar"],
			["Certification", "Gemological Certificate"],
		]),
		isActive: true,
		isFeatured: false,
		tags: ["gemstone", "ruby", "sun", "manik"],
	},
	{
		title: "Brass Diya Set (Pack of 5)",
		description:
			"Traditional brass oil lamps for daily puja and special occasions. Handcrafted with intricate designs.",
		category: "Pooja Items",
		price: 599,
		quantity: 50,
		productCode: "POO-3301",
		images: [
			{
				url: "/images/PoojaItems.png",
				alt: "Brass Diya Set",
			},
		],
		rating: {
			average: 4.6,
			count: 450,
		},
		specifications: new Map([
			["Material", "Pure Brass"],
			["Quantity", "5 Diyas"],
			["Height", "2.5 inches"],
		]),
		isActive: true,
		isFeatured: false,
		tags: ["pooja", "diya", "brass", "lamp"],
	},
	{
		title: "Bhagavad Gita - Complete Edition",
		description:
			"Complete Bhagavad Gita with Sanskrit shlokas, Hindi and English translation. Hardcover edition.",
		category: "Spiritual Books",
		price: 499,
		quantity: 100,
		productCode: "BOOK-7701",
		images: [
			{
				url: "/images/SpiritualBooks.png",
				alt: "Bhagavad Gita",
			},
		],
		rating: {
			average: 4.9,
			count: 890,
		},
		specifications: new Map([
			["Pages", "720"],
			["Language", "Sanskrit, Hindi, English"],
			["Binding", "Hardcover"],
		]),
		isActive: true,
		isFeatured: true,
		tags: ["book", "gita", "spiritual", "bhagavad"],
	},
	{
		title: "Vedic Astrology Guide",
		description:
			"Comprehensive guide to Vedic Astrology for beginners and practitioners. Written by renowned astrologers.",
		category: "Spiritual Books",
		price: 899,
		quantity: 45,
		productCode: "BOOK-7702",
		images: [
			{
				url: "/images/SpiritualBooks.png",
				alt: "Vedic Astrology Guide",
			},
		],
		rating: {
			average: 4.8,
			count: 420,
		},
		specifications: new Map([
			["Pages", "560"],
			["Language", "English"],
			["Binding", "Paperback"],
		]),
		isActive: true,
		isFeatured: false,
		tags: ["book", "astrology", "vedic", "guide"],
	},
	{
		title: "5 Mukhi Rudraksha Mala (108 Beads)",
		description:
			"108 beads mala of 5 Mukhi Rudraksha. Blessed by Lord Shiva. Brings peace and mental clarity.",
		category: "Rudraksha",
		price: 2499,
		quantity: 30,
		productCode: "QRD-9846",
		images: [
			{
				url: "/images/Rudraksha.png",
				alt: "5 Mukhi Rudraksha Mala",
			},
		],
		rating: {
			average: 4.9,
			count: 670,
		},
		specifications: new Map([
			["Beads", "108 + 1 Sumeru"],
			["Origin", "Nepal"],
			["Certification", "Lab Certified"],
		]),
		isActive: true,
		isFeatured: true,
		tags: ["rudraksha", "mala", "shiva", "meditation"],
	},
	{
		title: "Emerald (Panna)",
		description:
			"Natural Emerald gemstone for Mercury. Enhances intelligence, communication and business success.",
		category: "Gemstones",
		price: 7999,
		quantity: 12,
		productCode: "GEM-5423",
		images: [
			{
				url: "/images/Gemstones.png",
				alt: "Emerald",
			},
		],
		rating: {
			average: 4.7,
			count: 290,
		},
		specifications: new Map([
			["Weight", "4.5 Carats"],
			["Origin", "Colombia"],
			["Certification", "Gemological Certificate"],
		]),
		isActive: true,
		isFeatured: false,
		tags: ["gemstone", "emerald", "mercury", "panna"],
	},
];

const seedProducts = async () => {
	try {
		await connectDB();

		// Clear existing products
		await Product.deleteMany({});
		console.log("Existing products cleared");

		// Insert sample products
		const products = await Product.insertMany(sampleProducts);
		console.log(`✅ ${products.length} products seeded successfully`);

		// Display summary
		console.log("\n📦 Products Summary:");
		products.forEach((product) => {
			console.log(
				`   - ${product.title} (${product.category}) - ₹${product.price} - Code: ${product.productCode}`
			);
		});

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding products:", error);
		process.exit(1);
	}
};

seedProducts();
