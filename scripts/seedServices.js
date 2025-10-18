// DEPRECATED: This legacy seeder is disabled. Use exportStaticData/importStaticData instead.
// To reseed static content:
// 1) Set MONGO_URI to the source DB and run: npm run export:static (in Server)
// 2) Switch MONGO_URI to the target DB and run: npm run import:static (in Server)
if (process.env.ALLOW_LEGACY_SEED !== "true") {
	console.error(
		"[DEPRECATED] scripts/seedServices.js is disabled. Use export:static/import:static."
	);
	process.exit(1);
}

import mongoose from "mongoose";
import Service from "../model/ServiceModel.js";
import User from "../model/UserModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ============= CONSULTATIONS =============
// Astrology Consultations
const astrologyConsultations = [
	{
		title: "Basic Astrology Consultation",
		description:
			"One Time Consultation on Horoscope of 1 Individual on Call or at Vastu Abhishek Center.",
		price: 11000,
		originalPrice: 11000,
		category: "astrology",
		serviceType: "consultation",
		subCategory: "Astrology Consultation",
		features: [
			"Answers for up to 3 questions with Solutions and Remedies.",
			"30-minute consultation session",
			"Personalized horoscope reading",
		],
		isActive: true,
	},
	{
		title: "Silver Astrology Consultation",
		description:
			"Detailed Horoscope Analysis of 1 Individual with Remedies, Gemstone Recommendation, and Donation Recommendation.",
		price: 25000,
		originalPrice: 25000,
		category: "astrology",
		serviceType: "consultation",
		subCategory: "Astrology Consultation",
		features: [
			"Detailed Horoscope Analysis",
			"Gemstone Recommendations",
			"Donation Recommendations",
			"All Astrological Remedies for Problem Solving",
			"Guidance for Attracting Money, Growth, and Success",
			"Valid for 6 months with free follow-ups",
		],
		isActive: true,
	},
	{
		title: "Gold Astrology Consultation",
		description:
			"Comprehensive Horoscope Analysis with Career, Marriage, and Financial Guidance.",
		price: 50000,
		originalPrice: 50000,
		category: "astrology",
		serviceType: "consultation",
		subCategory: "Astrology Consultation",
		features: [
			"Complete Life Analysis",
			"Career and Business Guidance",
			"Marriage and Relationship Analysis",
			"Financial Planning as per Planets",
			"Health Predictions and Remedies",
			"Lucky Dates, Colors, and Directions",
			"Valid for 1 year with unlimited follow-ups",
		],
		isActive: true,
	},
	{
		title: "Platinum Astrology Consultation",
		description:
			"Premium Horoscope Analysis with Personalized Remedial Solutions and Yearly Guidance.",
		price: 70000,
		originalPrice: 70000,
		category: "astrology",
		serviceType: "consultation",
		subCategory: "Astrology Consultation",
		features: [
			"Complete Life Path Analysis",
			"Yearly Planetary Transit Predictions",
			"Personalized Remedial Solutions",
			"Career, Business, and Financial Mastery",
			"Marriage and Family Harmony Guidance",
			"Health and Longevity Predictions",
			"Priority Support and Guidance",
			"Valid for 1 year with unlimited consultations",
		],
		isActive: true,
	},
];

// Vastu for Home Consultations
const vastuHomeConsultations = [
	{
		title: "Astro Vastu Consultation",
		description:
			"Complete Vastu Consultation for your home with online consultation. Minimum Area Chargeable is 1000 Sq. Ft. Per Floor. Includes 1 complete Horoscope Analysis and Astro Vastu Remedies for your Home with 1 year validity.",
		price: 50000, // 50 per sq ft * 1000 sq ft minimum
		originalPrice: 50000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Home",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 1000 Sq. Ft. Per Floor.",
			"1 complete Horoscope Analysis.",
			"Astro Vastu Remedies for your Home.",
			"Online Consultation.",
			"1 year Validity.",
			"Free follow ups on Vastu as well as Horoscope throughout the year.",
			"Ideal Package for getting Growth in Life.",
			"Astrological Growth Remedies like Gemstones, Donations, Etc. Included.",
			"Watsapp Chat With Us",
		],
		isActive: true,
	},
	{
		title: "Astro Vastu Consultation with Site Visit",
		description:
			"Complete Vastu Consultation with Site Visit by Vastu Guru Abhishek Goel. Minimum Area Chargeable is 1250 Sq. Ft. Per Floor. Includes 2 complete Horoscope Analysis with 1 Year Validity.",
		price: 125000, // 100 per sq ft * 1250 sq ft minimum
		originalPrice: 125000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Home",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 1250 Sq. Ft. Per Floor.",
			"2 complete Horoscope Analysis.",
			"1 Site Visit by Vastu Guru Abhishek Goel.",
			"Astro Vastu Remedies for your Home.",
			"1 Year Validity.",
			"Free follow ups on Vastu as well as Horoscope.",
			"Ideal Package for Getting Growth and Prosperity in Life.",
			"Astrological Growth Remedies like Gemstones, Donations, Etc. Included for Life.",
			"Watsapp Chat With Us",
		],
		isActive: true,
	},
	{
		title: "Astro Vastu - Site Selection Package",
		description:
			"If you are looking for a new home and confused which one to buy, this package is best for you. Share 3-4 layout plans of shortlisted homes and their google pin location. We'll select the best one for you as per your horoscopes.",
		price: 59000,
		originalPrice: 59000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Home",
		features: [
			"If you are looking for a new home and confused which one to buy, then this package is best for you. After buying this package, you can share 3-4 layout plans of shortlisted homes and their google pin location. We'll select the best one for you as per your horoscopes. After the house gets finalized, you can take the normal Astro Vastu Consultation for your home as per above packages.",
			"Minimum Area Chargeable - Not Applicable.",
			"2 Horoscopes you can share for Site Selection.",
			"Online Consultation.",
			"Watsapp Chat With Us",
		],
		isActive: true,
	},
];

// Vastu for Office Consultations
const vastuOfficeConsultations = [
	{
		title: "Astro Vastu Consultation Online - Office",
		description:
			"Complete Vastu Consultation for your office with online consultation. Minimum Area Chargeable is 1000 Sq. Ft. Includes 1 complete Horoscope Analysis.",
		price: 50000, // 50 per sq ft * 1000 sq ft minimum
		originalPrice: 50000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Office",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 1000 Sq. Ft.",
			"Online Consultation.",
			"1 complete Horoscope Analysis.",
			"Astro Vastu Remedies for your Office.",
			"1 Year Validity.",
			"Free follow ups throughout the Year on Vastu as well as Horoscope.",
			"Chat With Us, Click here.",
		],
		isActive: true,
	},
	{
		title: "Astro Vastu with Consultation Site Visit - Office",
		description:
			"Complete Vastu Consultation with Site Visit for your office. Minimum Area Chargeable is 1250 Sq. Ft. Includes 2 complete Horoscope Analysis.",
		price: 125000, // 100 per sq ft * 1250 sq ft minimum
		originalPrice: 125000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Office",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 1250 Sq. Ft.",
			"1 Site Visit by Vastu Guru Abhishek Goel.",
			"2 complete Horoscope Analysis.",
			"Astro Vastu Remedies for your Office.",
			"1 Year Validity.",
			"Free follow ups on Vastu as well as Horoscope.",
			"Chat With Us, Click here.",
		],
		isActive: true,
	},
];

// Vastu for Factory/Commercial Consultations
const vastuFactoryConsultations = [
	{
		title: "Astro Vastu Consultation Online - Industrial",
		description:
			"Complete Vastu Consultation for Industrial/Commercial Units. Minimum Area Chargeable is 2500 Sq. Ft. Includes Horoscope Analysis with 1 Year Validity.",
		price: 125000, // 50 per sq ft * 2500 sq ft minimum
		originalPrice: 125000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Factory/Commercial",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 2500 Sq. Ft.",
			"Online Consultation.",
			"Horoscope Analysis.",
			"1 Year Validity.",
			"Free follow ups throughout the Year.",
		],
		isActive: true,
	},
	{
		title: "Astro Vastu with Site Visit - Industrial",
		description:
			"Complete Vastu Consultation with Site Visit for Industrial/Commercial Units. Minimum Area Chargeable is 2500 Sq. Ft. Includes 2 complete Horoscope Analysis with 2 Year Validity.",
		price: 250000, // 100 per sq ft * 2500 sq ft minimum
		originalPrice: 250000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Factory/Commercial",
		features: [
			"Complete Vastu Consultation.",
			"Minimum Area Chargeable is 2500 Sq. Ft.",
			"1 Site Visit by Vastu Guru Abhishek Goel.",
			"2 complete Horoscope Analysis.",
			"Astro Vastu Remedies for your Factory.",
			"2 Year Validity.",
			"Free follow ups on Vastu as well as Horoscope.",
		],
		isActive: true,
	},
	{
		title: "Project Vastu Package",
		description:
			"Complete Astro Vastu Planning for Industrial, Commercial, Residential, Hotel, Hospital, Commercial Mall, Shopping Mall and all other projects. Includes 2-3 Site Visits as and when required.",
		price: 5100000, // 51 lacs
		originalPrice: 5100000,
		category: "vastu",
		serviceType: "consultation",
		subCategory: "Vastu for Factory/Commercial",
		features: [
			"Complete Astro Vastu Planning.",
			"Horoscope Analysis of all Partners or Owners.",
			"Step by Step Guidance.",
			"Industrial, Commercial, Residential, Hotel, Hospital, Commercial Mall, Shopping Mall and all other projects included in this package.",
			"2-3 Site Visits as and when required.",
			"For Discussion with Vastu Guru Abhishek Goel, Call +919599967655.",
		],
		isActive: true,
	},
];

// ============= PACKAGES =============
// Astrology Packages
const astrologyPackages = [
	{
		title: "Basic Astrology Package",
		description:
			"One Time Consultation on Horoscope of 1 Individual on Call or at Vastu Abhishek Center.",
		price: 11000,
		originalPrice: 11000,
		category: "astrology",
		serviceType: "package",
		subCategory: "Astrology Package",
		features: ["Answers for up to 3 questions with Solutions and Remedies."],
		isActive: true,
	},
	{
		title: "Silver Astrology Package",
		description:
			"Horoscope Analysis of 1 Individual with Remedies, Gemstone Recommendation, and Donation Recommendation.",
		price: 25000,
		originalPrice: 25000,
		category: "astrology",
		serviceType: "package",
		subCategory: "Astrology Package",
		features: [
			"All Astrological Remedies for Problem Solving.",
			"Guidance for Attracting Money, Growth, and Success in Life.",
			"Consultation Package is valid for 1 year.",
		],
		isActive: true,
	},
	{
		title: "Gold Astrology Package",
		description:
			"Horoscope Analysis of 3 Individuals with Remedies, Gemstone Recommendation, and Donation Recommendation.",
		price: 50000,
		originalPrice: 50000,
		category: "astrology",
		serviceType: "package",
		subCategory: "Astrology Package",
		features: [
			"All Astrological Remedies for Problem Solving.",
			"Guidance for Attracting Money, Growth, and Success in Life.",
			"Consultation Package is valid for 1 year.",
		],
		isActive: true,
	},
	{
		title: "Platinum Astrology Package",
		description:
			"Horoscope Analysis of 4 Individuals with Remedies, Gemstone Recommendation, and Donation Recommendation.",
		price: 70000,
		originalPrice: 70000,
		category: "astrology",
		serviceType: "package",
		subCategory: "Astrology Package",
		features: [
			"All Astrological Remedies for Problem Solving.",
			"Guidance for Attracting Money, Growth, and Success in Life.",
			"Consultation Package is valid for 1 year.",
		],
		isActive: true,
	},
];

// Numero Packages
const numeroPackages = [
	{
		title: "Basic Numero Package - Signature Correction",
		description:
			"Signature Correction and Guidance on problems caused by current signatures.",
		price: 11000,
		originalPrice: 11000,
		category: "numerology",
		serviceType: "package",
		subCategory: "Numero Package",
		features: [
			"Analysis of current signatures",
			"Correction techniques",
			"Guidance on avoiding issues caused by current signature patterns",
		],
		isActive: true,
	},
	{
		title: "Silver Numero Package - Complete Analysis",
		description:
			"Numero Analysis of 1 Individual with complete Numero Remedies including all Lucky numbers for Bank Account, Mobile, Home Number, Office Number, Car Number, Lucky Number, etc.",
		price: 25000,
		originalPrice: 25000,
		category: "numerology",
		serviceType: "package",
		subCategory: "Numero Package",
		features: [
			"Complete Numero Remedies",
			"Lucky numbers for Bank, Mobile, Home, Office, Car, etc.",
			"Get Free Signature Analysis with this report",
		],
		isActive: true,
	},
	{
		title: "Gold Numero Package - Numero Vastu Analysis",
		description:
			"Numero Vastu Analysis of 1 Individual with Remedies. You have to send furniture layout plan of your home which should be upto 1000 sq ft area. More than 1000 sq ft will be charged @Rs. 50/- per sq ft.",
		price: 50000,
		originalPrice: 50000,
		category: "numerology",
		serviceType: "package",
		subCategory: "Numero Package",
		features: [
			"Numero Vastu Analysis of 1 Individual",
			"Remedies included",
			"Furniture layout analysis (upto 1000 sq ft)",
			"Extra area charged @Rs. 50 per sq ft",
		],
		isActive: true,
	},
	{
		title: "Platinum Numero Package - Premium Analysis",
		description:
			"Numero Vastu Analysis of 3 Individuals with Remedies. You have to send furniture layout plan of your home which should be upto 2000 sq ft area. More than 2000 sq ft will be charged @Rs. 50/- per sq ft.",
		price: 125000,
		originalPrice: 125000,
		category: "numerology",
		serviceType: "package",
		subCategory: "Numero Package",
		features: [
			"Numero Vastu Analysis of 3 Individuals",
			"Remedies included",
			"Furniture layout analysis (upto 2000 sq ft)",
			"Extra area charged @Rs. 50 per sq ft",
			"Get Free Signature Analysis for 3 with this report",
		],
		isActive: true,
	},
];

// Vastu Packages
const vastuPackages = [
	{
		title: "Basic Vastu Package",
		description:
			"Basic Vastu consultation package for your home or office with fundamental remedies.",
		price: 15000,
		originalPrice: 15000,
		category: "vastu",
		serviceType: "package",
		subCategory: "Vastu Package",
		features: [
			"Basic Vastu Analysis",
			"Fundamental Vastu Remedies",
			"Email/Phone Support",
			"Valid for 6 months",
		],
		isActive: true,
	},
	{
		title: "Silver Vastu Package",
		description:
			"Comprehensive Vastu package with detailed analysis and remedies for your property.",
		price: 30000,
		originalPrice: 30000,
		category: "vastu",
		serviceType: "package",
		subCategory: "Vastu Package",
		features: [
			"Detailed Vastu Analysis",
			"Comprehensive Remedies",
			"Online Consultation Included",
			"Valid for 1 year",
			"Free follow-ups",
		],
		isActive: true,
	},
	{
		title: "Gold Vastu Package",
		description:
			"Premium Vastu package with advanced analysis and personalized solutions.",
		price: 60000,
		originalPrice: 60000,
		category: "vastu",
		serviceType: "package",
		subCategory: "Vastu Package",
		features: [
			"Advanced Vastu Analysis",
			"Personalized Solutions",
			"2 Online Consultations",
			"Valid for 1 year",
			"Priority Support",
			"Free follow-ups throughout the year",
		],
		isActive: true,
	},
];

const seedServices = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log("✅ Connected to MongoDB");

		// Find admin user (astrologer role)
		const admin = await User.findOne({
			email: "antilaman3113@gmail.com",
			role: "astrologer",
		});
		if (!admin) {
			console.log(
				"❌ No admin/astrologer user found with email: antilaman3113@gmail.com"
			);
			console.log(
				"💡 Please make sure this user exists in the database with role 'astrologer'"
			);
			process.exit(1);
		}

		console.log(`✅ Found admin user: ${admin.name || admin.email}`);

		// Clear existing services
		await Service.deleteMany({});
		console.log("🗑️  Cleared existing services");

		// Prepare all services with createdBy field
		const allServices = [
			...astrologyConsultations,
			...vastuHomeConsultations,
			...vastuOfficeConsultations,
			...vastuFactoryConsultations,
			...astrologyPackages,
			...numeroPackages,
			...vastuPackages,
		].map((service) => ({
			...service,
			createdBy: admin._id,
		}));

		// Insert all services
		const insertedServices = await Service.insertMany(allServices);
		console.log(`✅ Successfully seeded ${insertedServices.length} services`);

		// Summary
		const consultationCount = await Service.countDocuments({
			serviceType: "consultation",
		});
		const packageCount = await Service.countDocuments({
			serviceType: "package",
		});

		// Detailed counts
		const astrologyConsultationCount = await Service.countDocuments({
			serviceType: "consultation",
			subCategory: "Astrology Consultation",
		});
		const vastuHomeCount = await Service.countDocuments({
			serviceType: "consultation",
			subCategory: "Vastu for Home",
		});
		const vastuOfficeCount = await Service.countDocuments({
			serviceType: "consultation",
			subCategory: "Vastu for Office",
		});
		const vastuFactoryCount = await Service.countDocuments({
			serviceType: "consultation",
			subCategory: "Vastu for Factory/Commercial",
		});
		const astrologyPackageCount = await Service.countDocuments({
			serviceType: "package",
			subCategory: "Astrology Package",
		});
		const numeroPackageCount = await Service.countDocuments({
			serviceType: "package",
			subCategory: "Numero Package",
		});
		const vastuPackageCount = await Service.countDocuments({
			serviceType: "package",
			subCategory: "Vastu Package",
		});

		console.log("\n📊 Summary:");
		console.log(`   • Total Services: ${insertedServices.length}`);
		console.log(`   • Total Consultations: ${consultationCount}`);
		console.log(`   • Total Packages: ${packageCount}`);
		console.log("\n💡 Consultations by Sub-Category:");
		console.log(`   • Astrology Consultation: ${astrologyConsultationCount}`);
		console.log(`   • Vastu for Home: ${vastuHomeCount}`);
		console.log(`   • Vastu for Office: ${vastuOfficeCount}`);
		console.log(`   • Vastu for Factory/Commercial: ${vastuFactoryCount}`);
		console.log("\n📦 Packages by Sub-Category:");
		console.log(`   • Astrology Package: ${astrologyPackageCount}`);
		console.log(`   • Numero Package: ${numeroPackageCount}`);
		console.log(`   • Vastu Package: ${vastuPackageCount}`);

		await mongoose.connection.close();
		console.log("\n🎉 Service seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error seeding services:", error);
		process.exit(1);
	}
};

seedServices();
