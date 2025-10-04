import mongoose from "mongoose";
import dotenv from "dotenv";
import Consultation from "../model/ConsultationModel.js";
import ProductOrder from "../model/ProductOrderModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const consultationData = [
	{
		title: "Career Advice",
		customer: {
			customerId: "CUST-2025-1087",
			customerName: "Aditi R. Sharma",
			phone: "+91 9876543201",
			city: "Pune, India",
		},
		instructor: {
			name: "Deepa R.",
		},
		consultationDetails: {
			date: new Date("2025-07-18"),
			time: "8:00 PM",
			mode: "Online (Zoom)",
			topic: "Career Guidance and Job Prospects",
			language: "Hindi",
		},
		pricing: {
			price: 599,
		},
		status: "paid",
		rating: {
			value: 4.9,
			reviews: 560,
		},
	},
	{
		title: "Marriage Consultation",
		customer: {
			customerId: "CUST-2025-1088",
			customerName: "Rahul Verma",
			phone: "+91 9876543202",
			city: "Mumbai, India",
		},
		instructor: {
			name: "Deepa R.",
		},
		consultationDetails: {
			date: new Date("2025-07-19"),
			time: "7:00 PM",
			mode: "Online (Zoom)",
			topic: "Marriage Consultation",
			language: "English",
		},
		pricing: {
			price: 799,
		},
		status: "paid",
		rating: {
			value: 4.8,
			reviews: 423,
		},
	},
	{
		title: "Family Counseling",
		customer: {
			customerId: "CUST-2025-1089",
			customerName: "Priya Patel",
			phone: "+91 9876543203",
			city: "Ahmedabad, India",
		},
		instructor: {
			name: "Rajesh Kumar",
		},
		consultationDetails: {
			date: new Date("2025-07-20"),
			time: "5:30 PM",
			mode: "Online (Phone)",
			topic: "Family Counseling",
			language: "Hindi",
		},
		pricing: {
			price: 499,
		},
		status: "confirmed",
		rating: {
			value: 4.7,
			reviews: 312,
		},
	},
	{
		title: "Business Consultation",
		customer: {
			customerId: "CUST-2025-1090",
			customerName: "Amit Shah",
			phone: "+91 9876543204",
			city: "Delhi, India",
		},
		instructor: {
			name: "Deepa R.",
		},
		consultationDetails: {
			date: new Date("2025-07-21"),
			time: "9:00 AM",
			mode: "Online (Zoom)",
			topic: "Business Growth and Opportunities",
			language: "English",
		},
		pricing: {
			price: 899,
		},
		status: "paid",
		rating: {
			value: 4.9,
			reviews: 678,
		},
	},
	{
		title: "Health Consultation",
		customer: {
			customerId: "CUST-2025-1091",
			customerName: "Sneha Desai",
			phone: "+91 9876543205",
			city: "Bangalore, India",
		},
		instructor: {
			name: "Rajesh Kumar",
		},
		consultationDetails: {
			date: new Date("2025-07-22"),
			time: "6:00 PM",
			mode: "Online (Zoom)",
			topic: "Health and Wellness Guidance",
			language: "Hindi",
		},
		pricing: {
			price: 699,
		},
		status: "pending",
		rating: {
			value: 4.6,
			reviews: 245,
		},
	},
	{
		title: "Education Guidance",
		customer: {
			customerId: "CUST-2025-1092",
			customerName: "Vikram Singh",
			phone: "+91 9876543206",
			city: "Jaipur, India",
		},
		instructor: {
			name: "Deepa R.",
		},
		consultationDetails: {
			date: new Date("2025-07-23"),
			time: "4:00 PM",
			mode: "Online (Zoom)",
			topic: "Education and Career Path",
			language: "Hindi",
		},
		pricing: {
			price: 599,
		},
		status: "confirmed",
		rating: {
			value: 4.8,
			reviews: 389,
		},
	},
];

const productOrderData = [
	{
		orderId: "ORD-9845",
		customer: {
			customerId: "CUST-2025-2001",
			customerName: "Swati Joshi",
			phone: "+91 9876543210",
			email: "swati.joshi@email.com",
		},
		product: {
			title: "7 Mukhi Rudraksha",
			category: "Rudraksha",
			quantity: 1,
			price: 1299,
			image: "/images/SevenMukhiRudraksh.png",
		},
		shipping: {
			addressLines: ["7 Mukhi Rudraksha", "Flat 203, Building A"],
			city: "Pune",
			state: "Maharashtra",
			pincode: "411001",
			country: "India",
		},
		payment: {
			amount: 1299,
			paymentStatus: "paid",
		},
		orderStatus: "Order Delivered",
		tracking: {
			steps: [
				{
					label: "Order Confirmed",
					date: new Date("2025-07-03"),
					completed: true,
				},
				{
					label: "Order Shipped",
					date: new Date("2025-07-07"),
					completed: true,
				},
				{
					label: "Order Delivered",
					date: new Date("2025-07-13"),
					completed: true,
				},
			],
			currentStep: 2,
		},
		orderDate: new Date("2025-07-10"),
		deliveryDate: new Date("2025-07-13"),
		rating: {
			value: 4.9,
			reviews: 560,
		},
	},
	{
		orderId: "ORD-9846",
		customer: {
			customerId: "CUST-2025-2002",
			customerName: "Rajesh Kumar",
			phone: "+91 9876543211",
			email: "rajesh.kumar@email.com",
		},
		product: {
			title: "Blue Sapphire Gemstone",
			category: "Gemstones",
			quantity: 1,
			price: 2499,
			image: "/images/ColorGemstone.png",
		},
		shipping: {
			addressLines: ["302, Sunrise Apartments"],
			city: "Mumbai",
			state: "Maharashtra",
			pincode: "400001",
			country: "India",
		},
		payment: {
			amount: 2499,
			paymentStatus: "paid",
		},
		orderStatus: "Order Shipped",
		tracking: {
			steps: [
				{
					label: "Order Confirmed",
					date: new Date("2025-07-15"),
					completed: true,
				},
				{
					label: "Order Shipped",
					date: new Date("2025-07-18"),
					completed: true,
				},
				{
					label: "Order Delivered",
					date: null,
					completed: false,
				},
			],
			currentStep: 1,
		},
		orderDate: new Date("2025-07-15"),
		rating: {
			value: 4.8,
			reviews: 342,
		},
	},
	{
		orderId: "ORD-9847",
		customer: {
			customerId: "CUST-2025-2003",
			customerName: "Priya Sharma",
			phone: "+91 9876543212",
			email: "priya.sharma@email.com",
		},
		product: {
			title: "Hanuman Chalisa Book",
			category: "Spiritual Books",
			quantity: 2,
			price: 299,
			image: "/images/SpiritualBooks.png",
		},
		shipping: {
			addressLines: ["456, Green Park Colony"],
			city: "Delhi",
			state: "Delhi",
			pincode: "110016",
			country: "India",
		},
		payment: {
			amount: 598,
			paymentStatus: "paid",
		},
		orderStatus: "Order Confirmed",
		tracking: {
			steps: [
				{
					label: "Order Confirmed",
					date: new Date("2025-07-20"),
					completed: true,
				},
				{
					label: "Order Shipped",
					date: null,
					completed: false,
				},
				{
					label: "Order Delivered",
					date: null,
					completed: false,
				},
			],
			currentStep: 0,
		},
		orderDate: new Date("2025-07-20"),
		rating: {
			value: 4.7,
			reviews: 189,
		},
	},
];

const seedData = async () => {
	try {
		await connectDB();

		console.log("🗑️  Clearing existing data...");
		await Consultation.deleteMany({});
		await ProductOrder.deleteMany({});

		console.log("📝 Seeding Consultation data...");
		const consultations = await Consultation.insertMany(consultationData);
		console.log(`✅ ${consultations.length} consultations created`);

		console.log("📝 Seeding Product Order data...");
		const orders = await ProductOrder.insertMany(productOrderData);
		console.log(`✅ ${orders.length} product orders created`);

		console.log("🎉 Seed data created successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding data:", error);
		process.exit(1);
	}
};

seedData();
