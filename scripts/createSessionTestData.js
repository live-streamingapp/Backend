/**
 * Quick Session Test Data Creator
 * Run this script to create test instructor and session data
 */

// DEPRECATED: This legacy seeder is disabled. Use exportStaticData/importStaticData instead.
if (process.env.ALLOW_LEGACY_SEED !== "true") {
	console.error(
		"[DEPRECATED] scripts/createSessionTestData.js is disabled. Use export:static/import:static."
	);
	process.exit(1);
}

import mongoose from "mongoose";
import dotenv from "dotenv";
import Instructor from "../model/InstructorModel.js";
import Course from "../model/CourseModel.js";
import CourseSession from "../model/CourseSessionModel.js";

dotenv.config();

const createTestData = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		// 1. Create a test instructor if none exists
		const instructorCount = await Instructor.countDocuments();
		if (instructorCount === 0) {
			const instructor = new Instructor({
				name: "Dr. Raj Kumar",
				bio: "Expert Vedic Astrologer with 15+ years of experience",
				specialties: ["Vedic Astrology", "Vastu Shastra", "Numerology"],
				rating: 4.8,
				students: 150,
			});
			await instructor.save();
			console.log("✅ Test instructor created");
		} else {
			console.log(`✅ Found ${instructorCount} instructor(s)`);
		}

		// 2. Check courses
		const courseCount = await Course.countDocuments();
		if (courseCount === 0) {
			const course = new Course({
				title: "Vedic Astrology Basics",
				description: "Learn the fundamentals of Vedic Astrology",
				category: "Astrology",
				price: 999,
				instructor: (await Instructor.findOne())._id,
				duration: 8, // 8 weeks
				isActive: true,
			});
			await course.save();
			console.log("✅ Test course created");
		} else {
			console.log(`✅ Found ${courseCount} course(s)`);
		}

		// 3. Create test sessions with different statuses and times
		const sessionCount = await CourseSession.countDocuments();
		if (sessionCount === 0) {
			const instructor = await Instructor.findOne();
			const course = await Course.findOne();

			const testSessions = [
				{
					title: "Introduction to Vedic Astrology",
					description: "Overview of Vedic Astrology principles",
					sessionNumber: 1,
					scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
					scheduledTime: "10:00",
					duration: 60,
					status: "scheduled",
				},
				{
					title: "Planetary Positions and Houses",
					description: "Understanding the 12 houses and planetary influences",
					sessionNumber: 2,
					scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
					scheduledTime: "14:00",
					duration: 90,
					status: "scheduled",
				},
				{
					title: "Chart Reading Basics",
					description: "How to read and interpret birth charts",
					sessionNumber: 3,
					scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (will show as missed)
					scheduledTime: "16:00",
					duration: 75,
					status: "completed",
				},
			];

			for (const sessionData of testSessions) {
				const session = new CourseSession({
					...sessionData,
					course: course._id,
					instructor: instructor._id,
					enrolledStudents: [], // Empty for now
					chatEnabled: true,
				});
				await session.save();
			}
			console.log("✅ Test sessions created");
		} else {
			console.log(`✅ Found ${sessionCount} session(s)`);
		}

		console.log("\n🎉 Test data setup complete!");
		console.log("You can now:");
		console.log("1. Create new sessions in admin panel");
		console.log("2. View existing sessions");
		console.log("3. Test session joining functionality");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating test data:", error);
		process.exit(1);
	}
};

createTestData();
