import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const timelineSchema = new Schema(
	{
		label: { type: String, required: true },
		value: { type: Number, required: true },
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
			enum: ["On Track", "Behind", "Ahead"],
			default: "On Track",
		},
		timeline: { type: [timelineSchema], default: [] },
		avatar: { type: String },
	},
	{ timestamps: true }
);

const StudentProgress = model("StudentProgress", studentProgressSchema);

export default StudentProgress;
