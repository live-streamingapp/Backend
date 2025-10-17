import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

// Schema for managing live course sessions with Agora integration
const courseSessionSchema = new Schema(
	{
		// Basic Session Info
		course: { type: Types.ObjectId, ref: "Course", required: true },
		instructor: { type: Types.ObjectId, ref: "Instructor", required: true },
		title: { type: String, required: true },
		description: { type: String },
		sessionNumber: { type: Number, required: true }, // Session order in course

		// Scheduling
		scheduledDate: { type: Date, required: true },
		scheduledTime: { type: String, required: true }, // "14:30"
		duration: { type: Number, required: true }, // Duration in minutes
		timezone: { type: String, default: "Asia/Kolkata" },

		// Session Status
		status: {
			type: String,
			enum: ["scheduled", "live", "completed", "cancelled", "rescheduled"],
			default: "scheduled",
		},

		// Agora Integration
		agora: {
			channelName: { type: String, unique: true }, // Agora channel name
			appId: { type: String }, // Agora App ID
			token: { type: String }, // Agora temporary token
			tokenExpiry: { type: Date }, // Token expiration time
			hostUid: { type: Number }, // Deterministic Agora UID of host
			hostName: { type: String }, // Display name of host
			recordingConfig: {
				enabled: { type: Boolean, default: true },
				recordingId: String, // Agora recording ID
				recordingUrl: String, // URL to recorded session
			},
		},

		// Attendance Tracking
		enrolledStudents: [
			{
				type: Types.ObjectId,
				ref: "User",
			},
		], // Students enrolled in the course

		attendedStudents: [
			{
				student: { type: Types.ObjectId, ref: "User" },
				joinedAt: { type: Date },
				leftAt: { type: Date },
				durationAttended: { type: Number }, // in minutes
				participationScore: { type: Number, min: 0, max: 100, default: 0 },
			},
		],

		// Session Content
		materials: [
			{
				title: String,
				type: { type: String, enum: ["pdf", "image", "link", "document"] },
				url: String,
				uploadedAt: { type: Date, default: Date.now },
			},
		],

		// Recording & Playback
		recording: {
			isRecorded: { type: Boolean, default: false }, // Recording is optional
			recordingUrl: String, // Optional URL to session recording (external link)
			recordingDuration: Number, // Optional duration in minutes
			thumbnailUrl: String, // Optional thumbnail URL
			isPublic: { type: Boolean, default: false }, // Can non-enrolled students view?
			downloadable: { type: Boolean, default: false },
			uploadedAt: Date, // When recording URL was added
			uploadedBy: { type: Types.ObjectId, ref: "User" }, // Admin who added the recording
		},

		// Session Metadata
		actualStartTime: Date,
		actualEndTime: Date,
		actualDuration: Number, // in minutes
		maxConcurrentUsers: { type: Number, default: 0 },
		totalViews: { type: Number, default: 0 },

		// Admin Controls
		isActive: { type: Boolean, default: true },
		createdBy: { type: Types.ObjectId, ref: "User" }, // Admin who created session
		lastModifiedBy: { type: Types.ObjectId, ref: "User" },

		// Session Notes & Summary
		sessionNotes: String, // Notes from instructor
		sessionSummary: String, // Auto-generated or manual summary
		keyTopicsCovered: [String],
		homeworkAssigned: String,

		// Chat & Interaction Data
		chatEnabled: { type: Boolean, default: true },
		chatMessages: [
			{
				student: { type: Types.ObjectId, ref: "User" },
				message: String,
				timestamp: { type: Date, default: Date.now },
				isQuestion: { type: Boolean, default: false },
				isAnswered: { type: Boolean, default: false },
			},
		],

		// Q&A Session
		questionsAsked: [
			{
				student: { type: Types.ObjectId, ref: "User" },
				question: String,
				answer: String,
				askedAt: { type: Date, default: Date.now },
				answeredAt: Date,
				isPublic: { type: Boolean, default: true },
			},
		],
	},
	{
		timestamps: true,
		// Add indexes for better query performance
		index: { course: 1, sessionNumber: 1 },
	}
);

// Indexes for efficient queries
courseSessionSchema.index({ course: 1, scheduledDate: 1 });
courseSessionSchema.index({ status: 1, scheduledDate: 1 });
courseSessionSchema.index({ "agora.channelName": 1 });
courseSessionSchema.index({ instructor: 1, scheduledDate: 1 });

// Pre-save middleware to generate unique channel name
courseSessionSchema.pre("save", async function (next) {
	if (!this.agora.channelName) {
		const prefix = process.env.AGORA_CHANNEL_PREFIX || "session_";
		const courseId = this.course.toString().slice(-6);
		const sessionNum = String(this.sessionNumber).padStart(2, "0");
		const timestamp = Date.now().toString().slice(-6);
		this.agora.channelName = `${prefix}course_${courseId}_session_${sessionNum}_${timestamp}`;
	}
	next();
});

// Method to start live session
courseSessionSchema.methods.startSession = function () {
	this.status = "live";
	this.actualStartTime = new Date();
	return this.save();
};

// Method to end live session
courseSessionSchema.methods.endSession = function () {
	this.status = "completed";
	this.actualEndTime = new Date();
	this.actualDuration = Math.floor(
		(this.actualEndTime - this.actualStartTime) / (1000 * 60)
	);
	return this.save();
};

// Method to mark student attendance
courseSessionSchema.methods.markAttendance = function (
	studentId,
	joinTime = new Date()
) {
	const existingAttendance = this.attendedStudents.find(
		(att) => att.student.toString() === studentId.toString()
	);

	if (!existingAttendance) {
		this.attendedStudents.push({
			student: studentId,
			joinedAt: joinTime,
		});
	}
	return this.save();
};

// Method to calculate attendance percentage
courseSessionSchema.methods.getAttendancePercentage = function () {
	return (this.attendedStudents.length / this.enrolledStudents.length) * 100;
};

// Virtual for session URL (for frontend)
courseSessionSchema.virtual("sessionUrl").get(function () {
	return `/course/${this.course}/session/${this._id}`;
});

// Virtual for session status display
courseSessionSchema.virtual("statusDisplay").get(function () {
	const now = new Date();
	const sessionDate = new Date(this.scheduledDate);

	if (this.status === "completed") return "Completed";
	if (this.status === "cancelled") return "Cancelled";
	if (this.status === "live") return "Live Now";
	if (sessionDate < now) return "Missed";
	if (sessionDate > now) return "Upcoming";
	return "Scheduled";
});

const CourseSession = model("CourseSession", courseSessionSchema);

export default CourseSession;
