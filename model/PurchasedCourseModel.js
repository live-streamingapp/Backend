import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const purchasedCourseSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    course: { type: Types.ObjectId, ref: "Course", required: true },
    purchasedAt: { type: Date, default: Date.now },
    paymentInfo: {
      transactionId: { type: String },
      amount: { type: Number },
      status: { type: String, default: "success" },
    },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PurchasedCourse = model("PurchasedCourse", purchasedCourseSchema);
export default PurchasedCourse;
