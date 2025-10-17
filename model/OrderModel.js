import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
	// Common fields
	itemType: {
		type: String,
		enum: ["course", "book", "package", "service"],
		required: true,
	},
	itemId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		refPath: "items.itemModel",
	},
	itemModel: {
		type: String,
		required: true,
		enum: ["Course", "Book", "Consultation", "Service"],
	},
	title: { type: String, required: true },
	price: { type: Number, required: true },
	quantity: { type: Number, default: 1 },
	image: { type: String },

	// Course-specific (enhanced to replace StudentBookingModel)
	courseDetails: {
		duration: Number,
		lessons: Number,
		instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
		// 🆕 Student Booking fields (migrated from StudentBookingModel)
		sessionDate: Date,
		sessionTime: String,
		astrologerName: String,
		payoutAmount: Number,
		isBooking: { type: Boolean, default: false }, // Identifies if this is a booking vs purchase
		bookingStatus: {
			type: String,
			enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
		},
		meetingLink: String,
		// 🆕 Progress tracking (replaces PurchasedCourseModel)
		progress: { type: Number, default: 0, min: 0, max: 100 },
		progressTracker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "StudentProgress",
		},
		purchasedAt: { type: Date, default: Date.now },
		lastAccessedAt: Date,
		completedAt: Date,
	},

	// Book-specific
	bookDetails: {
		author: String,
		isbn: String,
		pages: Number,
	},

	// Package/Consultation-specific
	packageDetails: {
		consultationType: {
			type: String,
			enum: ["astrology", "numerology", "vastu"],
		},
		duration: Number, // in minutes
		meetingMode: {
			type: String,
			enum: ["online", "in-person", "phone"],
		},
		scheduledDate: Date,
		scheduledTime: String,
	},

	// Service-specific
	serviceDetails: {
		serviceType: String,
		deliveryTime: String, // e.g., "2-3 days"
		specifications: [String],
	},
});

const orderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			unique: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		items: [orderItemSchema],

		// Order details
		totalAmount: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "declined", "accepted", "completed", "cancelled"],
			default: "pending",
		},

		// Payment information
		paymentMethod: {
			type: String,
			enum: ["card", "upi", "netbanking", "wallet", "cod", "pending"],
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed", "refunded"],
			default: "pending",
		},
		transactionId: String,
		paidAt: Date,

		// Shipping information (mainly for books and physical items)
		shippingAddress: {
			name: String,
			phone: String,
			addressLine1: String,
			addressLine2: String,
			city: String,
			state: String,
			pincode: String,
			country: { type: String, default: "India" },
		},

		// Additional details
		notes: String,
		adminNotes: String,

		// Status tracking
		statusHistory: [
			{
				status: String,
				updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				timestamp: { type: Date, default: Date.now },
				notes: String,
			},
		],

		// Delivery tracking (for books/physical items)
		trackingNumber: String,
		deliveredAt: Date,
	},
	{ timestamps: true }
);

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
	if (!this.orderNumber) {
		const count = await mongoose.model("Order").countDocuments();
		this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, "0")}`;
	}
	next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
