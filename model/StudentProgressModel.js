import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const timelineSchema = new Schema(
	{
		label: { type: String, required: true },
		value: { type: Number, required: true },
	},
	{ _id: false }
);

const reportDataSchema = new Schema(
	{
		completionPercentage: { type: Number, default: 0 },
		totalHours: { type: Number, default: 0 },
		skillsAcquired: [{ type: String }],
		recommendations: { type: String },
		achievements: [{ type: String }],
		certificateEligible: { type: Boolean, default: false },
	},
	{ _id: false }
);

const studentProgressSchema = new Schema(
	{
		student: { type: Types.ObjectId, ref: "User", required: true },
		course: { type: Types.ObjectId, ref: "Course", required: true },
		videosCompleted: { type: Number, default: 0 },
		videosTotal: { type: Number, default: 0 },
		quizzesCompleted: { type: Number, default: 0 },
		quizzesTotal: { type: Number, default: 0 },
		progressPercent: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ["On Track", "Behind", "Ahead", "Completed"],
			default: "On Track",
		},
		timeline: { type: [timelineSchema], default: [] },
		avatar: { type: String },

		// 🆕 Live Session Progress Tracking
		sessionProgress: {
			totalSessions: { type: Number, default: 0 },
			attendedSessions: { type: Number, default: 0 },
			attendancePercentage: { type: Number, default: 0 },
			lastSessionAttended: { type: Types.ObjectId, ref: "CourseSession" },
			sessionHistory: [
				{
					session: { type: Types.ObjectId, ref: "CourseSession" },
					attended: { type: Boolean, default: false },
					attendanceDuration: { type: Number, default: 0 }, // minutes
					participationScore: { type: Number, default: 0 },
					completedAt: Date,
				},
			],
		},

		// 🆕 Integrated Report Functionality (replacing StudentReportModel)
		reportFields: {
			reportGenerated: { type: Boolean, default: false },
			reportUrl: { type: String }, // URL to generated PDF report
			certificateUrl: { type: String }, // URL to certificate
			reportGeneratedAt: { type: Date },
			reportLevel: {
				type: String,
				enum: ["Basic", "Silver", "Gold", "Platinum", "Mid", "Advanced"],
				default: "Basic",
			},
			reportData: reportDataSchema,
			downloadedAt: { type: Date },
			uploadedBy: { type: String }, // Admin who uploaded/generated the report
		},
	},
	{ timestamps: true }
);

// Index for better query performance
studentProgressSchema.index({ student: 1, course: 1 }, { unique: true });
studentProgressSchema.index({ "reportFields.reportGenerated": 1 });
studentProgressSchema.index({ status: 1 });

// Method to generate report
studentProgressSchema.methods.generateReport = function () {
	this.reportFields.reportGenerated = true;
	this.reportFields.reportGeneratedAt = new Date();
	this.reportFields.reportData.completionPercentage = this.progressPercent;
	this.reportFields.reportData.certificateEligible = this.progressPercent >= 80;
};

// 🆕 Method to update session attendance
studentProgressSchema.methods.updateSessionAttendance = function (
	sessionId,
	attended = true,
	duration = 0,
	participationScore = 0
) {
	// Find existing session record or create new one
	let sessionRecord = this.sessionProgress.sessionHistory.find(
		(s) => s.session.toString() === sessionId.toString()
	);

	if (!sessionRecord) {
		sessionRecord = {
			session: sessionId,
			attended,
			attendanceDuration: duration,
			participationScore,
			completedAt: attended ? new Date() : null,
		};
		this.sessionProgress.sessionHistory.push(sessionRecord);
	} else {
		sessionRecord.attended = attended;
		sessionRecord.attendanceDuration = duration;
		sessionRecord.participationScore = participationScore;
		sessionRecord.completedAt = attended ? new Date() : null;
	}

	// Update attendance statistics
	this.sessionProgress.attendedSessions =
		this.sessionProgress.sessionHistory.filter((s) => s.attended).length;
	this.sessionProgress.attendancePercentage =
		this.sessionProgress.totalSessions > 0
			? (this.sessionProgress.attendedSessions /
					this.sessionProgress.totalSessions) *
			  100
			: 0;

	if (attended) {
		this.sessionProgress.lastSessionAttended = sessionId;
	}

	// Update overall progress percentage (combine videos + sessions)
	this.calculateOverallProgress();

	return this.save();
};

// 🆕 Method to calculate overall progress (videos + sessions)
studentProgressSchema.methods.calculateOverallProgress = function () {
	const videoProgress =
		this.videosTotal > 0 ? (this.videosCompleted / this.videosTotal) * 50 : 0;
	const sessionProgress =
		this.sessionProgress.totalSessions > 0
			? (this.sessionProgress.attendedSessions /
					this.sessionProgress.totalSessions) *
			  50
			: 0;

	this.progressPercent = Math.round(videoProgress + sessionProgress);

	// Update status based on progress
	if (this.progressPercent >= 100) {
		this.status = "Completed";
	} else if (this.progressPercent >= 75) {
		this.status = "On Track";
	} else if (this.progressPercent >= 50) {
		this.status = "Behind";
	} else {
		this.status = "Behind";
	}
};

// Virtual for report availability
studentProgressSchema.virtual("hasReport").get(function () {
	return this.reportFields.reportGenerated && this.reportFields.reportUrl;
});

const StudentProgress = model("StudentProgress", studentProgressSchema);

export default StudentProgress;
