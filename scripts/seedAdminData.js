import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../model/UserModel.js";
import Course from "../model/CourseModel.js";
import StudentReport from "../model/StudentReportModel.js";
import StudentBooking from "../model/StudentBookingModel.js";
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
		StudentReport.deleteMany({}),
		StudentBooking.deleteMany({}),
		StudentProgress.deleteMany({}),
	]);

	await StudentReport.insertMany([
		{
			student: studentOne._id,
			report: "Kundali Analysis",
			level: "Gold",
			downloadedAt: new Date("2025-07-10"),
			uploadedBy: "Astrologer Deepak",
		},
		{
			student: studentTwo._id,
			report: "Numerology Blueprint",
			level: "Silver",
			downloadedAt: new Date("2025-07-08"),
			uploadedBy: "Astrologer Preeti",
		},
	]);

	await StudentBooking.insertMany([
		{
			student: studentOne._id,
			course: courseOne._id,
			sessionDate: new Date("2025-07-11"),
			sessionTime: "18:00",
			astrologerName: "Rajeev Malhotra",
			paymentAmount: 799,
			payoutAmount: 799,
			paymentStatus: "Paid",
			avatar: "/images/aditi.png",
		},
		{
			student: studentTwo._id,
			course: courseOne._id,
			sessionDate: new Date("2025-08-05"),
			sessionTime: "16:30",
			astrologerName: "Priya Sharma",
			paymentAmount: 899,
			payoutAmount: 899,
			paymentStatus: "Paid",
			avatar: "/images/aditi.png",
		},
	]);

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
