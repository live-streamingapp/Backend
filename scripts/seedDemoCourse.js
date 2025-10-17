import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../model/UserModel.js";
import Course from "../model/CourseModel.js";
import CourseSession from "../model/CourseSessionModel.js";
import Instructor from "../model/InstructorModel.js";
import StudentProgress from "../model/StudentProgressModel.js";

const ensureUserByEmail = async (payload) => {
	const existing = await User.findOne({ email: payload.email });
	if (existing) return existing;
	return User.create(payload);
};

const ensureInstructor = async () => {
	let instructor = await Instructor.findOne();
	if (!instructor) {
		instructor = await Instructor.create({
			name: "Dr. Raj Kumar",
			bio: "Expert Vedic Astrologer with 15+ years of experience mentoring thousands of students.",
			profileImage: "/images/aditi.png",
			specialties: ["Vedic Astrology", "Vastu Shastra", "Numerology"],
			rating: 4.9,
			students: 1200,
		});
	}
	return instructor;
};

const upsertCourse = async ({ adminId, instructorId }) => {
	const title = "Astrology Masterclass: From Basics to Charts";
	let course = await Course.findOne({ title });
	if (course) return course;

	course = await Course.create({
		title,
		description:
			"A comprehensive, hands-on masterclass covering fundamentals of Vedic Astrology, planetary positions, houses, and real chart reading.",
		price: 999,
		originalPrice: 1999,
		image: "/images/Astrology.png",
		createdBy: adminId,
		lastUpdated: new Date().toLocaleDateString("en-IN", {
			month: "short",
			year: "numeric",
		}),
		languages: ["English"],
		subtitles: ["English"],
		premium: true,
		rating: 4.8,
		ratingCount: 275,
		learners: 1800,
		duration: 12, // hours
		lessons: 24,
		whatYouWillLearn: [
			"Understand the 12 houses and their significance",
			"Decode planetary strengths and aspects",
			"Read and interpret birth charts confidently",
			"Apply Vedic principles to real-life scenarios",
		],
		relatedTopics: [
			"Vedic Astrology",
			"Birth Charts",
			"Houses & Planets",
			"Transits",
			"Numerology",
		],
		courseIncludes: [
			"12 hours on-demand video",
			"Downloadable resources",
			"Full lifetime access",
			"Access on mobile and TV",
			"Certificate of completion",
		],
		requirements: [
			"Basic familiarity with astrology terms",
			"Willingness to practice chart reading",
			"Notebook for personal observations",
		],
		detailedDescription: [
			"This masterclass blends traditional Vedic principles with practical workflows. You'll learn to decode birth charts, evaluate planetary positions, and interpret real scenarios with confidence.",
		],
		courseContent: [
			{
				title: "Welcome & Orientation",
				preview: true,
				video: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
			},
			{
				title: "The 12 Houses Explained",
				preview: true,
				video: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
			},
			{
				title: "Planetary Strengths & Aspects",
				preview: false,
			},
			{
				title: "Reading Your First Chart",
				preview: false,
			},
			{ title: "Advanced Combinations", preview: false },
			{ title: "Case Studies & Practice", preview: false },
		],
		instructor: instructorId,
	});

	return course;
};

const createSessionsIfMissing = async ({
	courseId,
	instructorId,
	studentId,
}) => {
	const count = await CourseSession.countDocuments({ course: courseId });
	if (count > 0) return;

	const now = new Date();
	const oneDay = 24 * 60 * 60 * 1000;

	const sessions = [
		{
			title: "Introduction to Vedic Astrology",
			description: "Overview and orientation",
			sessionNumber: 1,
			scheduledDate: new Date(now.getTime() + oneDay), // tomorrow
			scheduledTime: "10:00",
			duration: 60,
			status: "scheduled",
		},
		{
			title: "Planetary Positions and Houses",
			description: "Deep dive into houses and planetary aspects",
			sessionNumber: 2,
			scheduledDate: new Date(now.getTime() + 3 * oneDay),
			scheduledTime: "14:00",
			duration: 90,
			status: "scheduled",
		},
		{
			title: "Chart Reading Workshop",
			description: "Hands-on chart reading with examples",
			sessionNumber: 3,
			scheduledDate: new Date(now.getTime() - oneDay), // yesterday
			scheduledTime: "16:00",
			duration: 75,
			status: "completed",
			recording: {
				isRecorded: true,
				recordingUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
				recordingDuration: 75,
				thumbnailUrl: "/images/Astrology.png",
				isPublic: false,
				downloadable: false,
				uploadedAt: new Date(),
			},
		},
	];

	for (const s of sessions) {
		const session = new CourseSession({
			...s,
			course: courseId,
			instructor: instructorId,
			enrolledStudents: studentId ? [studentId] : [],
			chatEnabled: true,
		});
		await session.save();
	}
};

const ensureEnrollmentAndProgress = async ({ student, course }) => {
	// Ensure student is enrolled in the course (used by /courses/enrolled)
	const user = await User.findById(student._id).select("enrolledCourses");
	const already = user.enrolledCourses.some(
		(cid) => cid.toString() === course._id.toString()
	);
	if (!already) {
		user.enrolledCourses.push(course._id);
		await user.save();
	}

	// Create or update progress entry for nicer demo
	const existing = await StudentProgress.findOne({
		student: student._id,
		course: course._id,
	});
	if (!existing) {
		await StudentProgress.create({
			student: student._id,
			course: course._id,
			videosCompleted: 6,
			videosTotal: 12,
			quizzesCompleted: 2,
			quizzesTotal: 4,
			progressPercent: 45,
			status: "On Track",
			timeline: [
				{ label: "Week 1", value: 20 },
				{ label: "Week 2", value: 35 },
				{ label: "Week 3", value: 45 },
			],
		});
	}
};

const main = async () => {
	try {
		await connectDB();

		// Ensure admin and a demo student exist
		const admin = await ensureUserByEmail({
			name: "Admin",
			email: "admin@astro.com",
			phone: "9999999999",
			dob: { day: 1, month: 1, year: 1990 },
			password: "password123",
			role: "astrologer",
		});

		const student = await ensureUserByEmail({
			name: "Demo Student",
			email: "student.demo@example.com",
			phone: "9876500000",
			dob: { day: 12, month: 7, year: 2000 },
			password: "Password@123",
			role: "student",
		});

		const instructor = await ensureInstructor();
		const course = await upsertCourse({
			adminId: admin._id,
			instructorId: instructor._id,
		});

		await createSessionsIfMissing({
			courseId: course._id,
			instructorId: instructor._id,
			studentId: student._id,
		});

		await ensureEnrollmentAndProgress({ student, course });

		console.log(
			"\n✅ Demo course, sessions, and enrollment seeded successfully!"
		);
		console.log(
			"\nLogin as this student to preview the enrolled course details page:"
		);
		console.log("   • Email: student.demo@example.com");
		console.log("   • Password: Password@123\n");
	} catch (e) {
		console.error("❌ Seeding demo course failed:", e?.message || e);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
	}
};

main();
