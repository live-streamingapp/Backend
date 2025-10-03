import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const studentReportSchema = new Schema(
	{
		student: { type: Types.ObjectId, ref: "User", required: true },
		report: { type: String, required: true, trim: true },
		level: {
			type: String,
			enum: ["Basic", "Silver", "Gold", "Platinum", "Mid", "Advanced"],
			default: "Basic",
		},
		downloadedAt: { type: Date, default: Date.now },
		uploadedBy: { type: String, required: true, trim: true },
	},
	{ timestamps: true }
);

const StudentReport = model("StudentReport", studentReportSchema);

export default StudentReport;
