import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../model/UserModel.js";
import Course from "../model/CourseModel.js";
import Order from "../model/OrderModel.js";
import StudentProgress from "../model/StudentProgressModel.js";

const ensureUser = async (payload) => {
	const existing = await User.findOne({ email: payload.email });
	if (existing) {
		return existing;
	}
	return User.create(payload);
};

const ensureCourse = async (payload) => {
	const existing = await Course.findOne({ title: payload.title });
	if (existing) {
		return existing;
	}
	return Course.create(payload);
};

const seed = async () => {
	await connectDB();

	// Ensure admin user exists
	const admin = await ensureUser({
		name: "Admin",
		email: "admin@astro.com",
		phone: "9999999999",
		dob: { day: 1, month: 1, year: 1990 },
		password: "password123",
		role: "astrologer",
	});

	const studentOne = await ensureUser({
		name: "Aditi R. Sharma",
		email: "aditi.sharma@example.com",
		phone: "9876543210",
		dob: { day: 12, month: 4, year: 1998 },
		password: "Password@123",
	});

	const studentTwo = await ensureUser({
		name: "Rahul P. Kumar",
		email: "rahul.kumar@example.com",
		phone: "9876501234",
		dob: { day: 7, month: 10, year: 1995 },
		password: "Password@123",
	});

	const courseOne = await ensureCourse({
		title: "Advanced Vedic Astrology",
		description: "Deep dive into vedic astrology fundamentals and practice.",
		price: 799,
		image: "/images/AstroVastu.png",
		createdBy: "Admin",
		lessons: 18,
		duration: 8,
	});

	const courseTwo = await ensureCourse({
		title: "Foundations of Numerology",
		description: "Master numerology calculations with ease.",
		price: 599,
		image: "/images/Astrology.png",
		createdBy: "Admin",
		lessons: 12,
		duration: 6,
	});

	// Clear existing admin seed collections to avoid duplicates
	await Promise.all([
		Order.deleteMany({ type: "booking" }),
		StudentProgress.deleteMany({}),
	]);

	// Create orders with booking data (replacing StudentBooking)
	await Order.insertMany([
		{
			userId: studentOne._id,
			type: "booking",
			status: "completed",
			totalAmount: 799,
			items: [
				{
					courseId: courseOne._id,
					quantity: 1,
					price: 799,
				},
			],
			paymentStatus: "paid",
			sessionDate: new Date("2025-07-11"),
			sessionTime: "18:00",
			astrologerName: "Rajeev Malhotra",
		},
		{
			userId: studentTwo._id,
			type: "booking",
			status: "completed",
			totalAmount: 899,
			items: [
				{
					courseId: courseOne._id,
					quantity: 1,
					price: 899,
				},
			],
			paymentStatus: "paid",
			sessionDate: new Date("2025-08-05"),
			sessionTime: "16:30",
			astrologerName: "Priya Sharma",
		},
	]);

	// Create student progress with integrated report functionality
	await StudentProgress.insertMany([
		{
			student: studentOne._id,
			course: courseOne._id,
			videosCompleted: 14,
			videosTotal: 18,
			quizzesCompleted: 4,
			quizzesTotal: 5,
			progressPercent: 78,
			status: "On Track",
			avatar: "/images/aditi.png",
			reportGenerated: true,
			reportUrl: "/reports/aditi-kundali-analysis.pdf",
			reportTitle: "Kundali Analysis",
			reportLevel: "Gold",
			reportUploadedBy: "Astrologer Deepak",
			timeline: [
				{ label: "Week 1", value: 45 },
				{ label: "Week 2", value: 60 },
				{ label: "Week 3", value: 55 },
				{ label: "Week 4", value: 80 },
				{ label: "Week 5", value: 70 },
				{ label: "Week 6", value: 88 },
			],
		},
		{
			student: studentTwo._id,
			course: courseTwo._id,
			videosCompleted: 8,
			videosTotal: 12,
			quizzesCompleted: 3,
			quizzesTotal: 4,
			progressPercent: 66,
			status: "On Track",
			avatar: "/images/aditi.png",
			reportGenerated: true,
			reportUrl: "/reports/rahul-numerology-blueprint.pdf",
			reportTitle: "Numerology Blueprint",
			reportLevel: "Silver",
			reportUploadedBy: "Astrologer Preeti",
			timeline: [
				{ label: "Week 1", value: 30 },
				{ label: "Week 2", value: 45 },
				{ label: "Week 3", value: 52 },
				{ label: "Week 4", value: 60 },
				{ label: "Week 5", value: 66 },
			],
		},
	]);

	console.log("✅ Admin data seeded successfully");
	await mongoose.disconnect();
};

seed()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
