import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "Product title is required"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: [
				"Gemstones",
				"Rudraksha",
				"Pooja Items",
				"Spiritual Books",
				"Color Gemstone",
				"Other",
			],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: [0, "Quantity cannot be negative"],
			default: 0,
		},
		images: [
			{
				url: { type: String },
				alt: { type: String },
			},
		],
		productCode: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
		},
		rating: {
			average: { type: Number, default: 0, min: 0, max: 5 },
			count: { type: Number, default: 0 },
		},
		reviews: [
			{
				userId: { type: Schema.Types.ObjectId, ref: "User" },
				userName: { type: String },
				rating: { type: Number, min: 1, max: 5 },
				comment: { type: String },
				createdAt: { type: Date, default: Date.now },
			},
		],
		specifications: {
			type: Map,
			of: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		tags: [{ type: String, trim: true }],
		discount: {
			type: { type: String, enum: ["percentage", "fixed"] },
			value: { type: Number, min: 0 },
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ productCode: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ createdAt: -1 });

// Virtual for final price after discount
productSchema.virtual("finalPrice").get(function () {
	if (!this.discount || !this.discount.value) return this.price;

	if (this.discount.type === "percentage") {
		return this.price - (this.price * this.discount.value) / 100;
	} else if (this.discount.type === "fixed") {
		return Math.max(0, this.price - this.discount.value);
	}
	return this.price;
});

// Method to update rating
productSchema.methods.updateRating = function () {
	if (this.reviews.length === 0) {
		this.rating.average = 0;
		this.rating.count = 0;
	} else {
		const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
		this.rating.average = sum / this.reviews.length;
		this.rating.count = this.reviews.length;
	}
};

const Product = model("Product", productSchema);

export default Product;
