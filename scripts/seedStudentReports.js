import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../model/UserModel.js";
import StudentReport from "../model/StudentReportModel.js";
import connectDB from "../config/db.js";

dotenv.config();

// Sample report types
const reportTypes = [
	"Birth Chart Analysis",
	"Career Prediction Report",
	"Marriage Compatibility",
	"Numerology Report",
	"Gemstone Recommendation",
	"Yearly Prediction",
	"Kundli Report",
	"Vastu Analysis",
];

// Valid levels from StudentReportModel: ["Basic", "Silver", "Gold", "Platinum", "Mid", "Advanced"]
const reportLevels = ["Basic", "Silver", "Gold", "Platinum", "Mid", "Advanced"];

// Function to generate random date within last year
const randomDate = (start, end) => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

const seedStudentReports = async () => {
	try {
		await connectDB();

		console.log("🔄 Starting student reports seed process...\n");

		// Clear existing reports
		const deletedReports = await StudentReport.deleteMany({});
		console.log(
			`🗑️  Cleared ${deletedReports.deletedCount} existing reports\n`
		);

		// Get all students
		const students = await User.find({ role: "student" }).limit(10);
		if (students.length === 0) {
			console.log(
				"⚠️  No students found. Please run 'npm run seed:customers' first"
			);
			process.exit(1);
		}
		console.log(`👥 Found ${students.length} students\n`);

		// Get admin/astrologer for uploadedBy
		let admin = await User.findOne({ role: "admin" });
		if (!admin) {
			admin = await User.findOne({ role: "astrologer" });
		}

		const uploaderName = admin?.name || "System Admin"; // Create reports for students
		const reports = [];
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
		const today = new Date();

		// Generate 2-4 reports per student
		for (const student of students) {
			const numReports = Math.floor(Math.random() * 3) + 2; // 2-4 reports

			for (let i = 0; i < numReports; i++) {
				const reportType =
					reportTypes[Math.floor(Math.random() * reportTypes.length)];
				const level =
					reportLevels[Math.floor(Math.random() * reportLevels.length)];
				const downloadedAt = randomDate(oneYearAgo, today);

				const report = {
					student: student._id,
					report: reportType,
					level: level,
					fileUrl: `/reports/${reportType.toLowerCase().replace(/\s+/g, "-")}-${
						student._id
					}.pdf`,
					downloadedAt: downloadedAt,
					uploadedBy: uploaderName,
				};

				reports.push(report);
			}
		}

		const createdReports = await StudentReport.insertMany(reports);
		console.log(`✅ ${createdReports.length} reports created\n`);

		// Populate and display summary
		const populatedReports = await StudentReport.find({})
			.populate("student", "name email")
			.sort({ downloadedAt: -1 })
			.limit(10);

		console.log("📊 Seeding Summary:");
		console.log(`   📄 Total Reports: ${createdReports.length}`);
		console.log(`   👥 Students with Reports: ${students.length}`);

		console.log("\n📋 Report Type Distribution:");
		const typeCount = {};
		createdReports.forEach((report) => {
			typeCount[report.report] = (typeCount[report.report] || 0) + 1;
		});
		Object.entries(typeCount).forEach(([type, count]) => {
			console.log(`   - ${type}: ${count}`);
		});

		console.log("\n📈 Report Level Distribution:");
		const levelCount = {};
		createdReports.forEach((report) => {
			levelCount[report.level] = (levelCount[report.level] || 0) + 1;
		});
		Object.entries(levelCount).forEach(([level, count]) => {
			console.log(`   - ${level}: ${count}`);
		});

		console.log("\n📝 Recent Reports (Sample):");
		populatedReports.slice(0, 5).forEach((report) => {
			console.log(
				`   - ${report.student.name}: ${report.report} (${
					report.level
				}) - ${report.downloadedAt.toLocaleDateString()}`
			);
		});

		console.log("\n✨ Seeding completed successfully!\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding student reports:", error);
		process.exit(1);
	}
};

seedStudentReports();
