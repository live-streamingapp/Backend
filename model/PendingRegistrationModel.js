import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "astrologer"],
    default: "student",
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpire: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Document will be automatically deleted after 1 hour
  },
});

// Index for faster queries
pendingRegistrationSchema.index({ email: 1 });
pendingRegistrationSchema.index({ otpExpire: 1 });

const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);

export default PendingRegistration;
