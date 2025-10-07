import Testimonial from "../../model/TestimonialModel.js";

// Get all approved testimonials (public)
const getTestimonials = async (req, res) => {
	try {
		const testimonials = await Testimonial.find({ status: "approved" })
			.sort({ createdAt: -1 })
			.select("-reviewedBy -reviewedAt");

		res.status(200).json(testimonials);
	} catch (error) {
		console.error("Error fetching testimonials:", error);
		res.status(500).json({ message: "Failed to fetch testimonials" });
	}
};

// Get all testimonials for admin (includes all statuses)
const getAdminTestimonials = async (req, res) => {
	try {
		const { status, page = 1, limit = 20 } = req.query;

		const filter = {};
		if (status && status !== "all") {
			filter.status = status;
		}

		const testimonials = await Testimonial.find(filter)
			.sort({ createdAt: -1 })
			.populate("submittedBy", "name email")
			.populate("reviewedBy", "name email")
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Testimonial.countDocuments(filter);

		// Return just the testimonials array for the frontend hook
		res.status(200).json(testimonials);
	} catch (error) {
		console.error("Error fetching admin testimonials:", error);
		res.status(500).json({ message: "Failed to fetch testimonials" });
	}
};

// Get testimonial by ID
const getTestimonialById = async (req, res) => {
	try {
		const { id } = req.params;

		const testimonial = await Testimonial.findById(id)
			.populate("submittedBy", "name email")
			.populate("reviewedBy", "name email");

		if (!testimonial) {
			return res.status(404).json({ message: "Testimonial not found" });
		}

		res.status(200).json(testimonial);
	} catch (error) {
		console.error("Error fetching testimonial:", error);
		res.status(500).json({ message: "Failed to fetch testimonial" });
	}
};

// Create new testimonial
const createTestimonial = async (req, res) => {
	try {
		const { name, to, rating, feedback, image } = req.body;

		// Validate required fields
		if (!name || !to || !rating || !feedback) {
			return res.status(400).json({
				message: "Name, service provider, rating, and feedback are required",
			});
		}

		// Validate rating
		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				message: "Rating must be between 1 and 5",
			});
		}

		const testimonial = new Testimonial({
			name: name.trim(),
			to: to.trim(),
			rating: parseInt(rating),
			feedback: feedback.trim(),
			image: image ? image.trim() : "",
			status: "approved", // Auto-approve testimonials created by admin
			submittedBy: req.user ? req.user.id : null,
			reviewedBy: req.user ? req.user.id : null,
			reviewedAt: new Date(),
		});

		await testimonial.save();

		res.status(201).json({
			message: "Testimonial created successfully",
			testimonial,
		});
	} catch (error) {
		console.error("Error creating testimonial:", error);
		res.status(500).json({ message: "Failed to create testimonial" });
	}
};

// Update testimonial
const updateTestimonial = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, to, rating, feedback, image } = req.body;

		// Validate rating if provided
		if (rating && (rating < 1 || rating > 5)) {
			return res.status(400).json({
				message: "Rating must be between 1 and 5",
			});
		}

		const updateData = {};
		if (name) updateData.name = name.trim();
		if (to) updateData.to = to.trim();
		if (rating) updateData.rating = parseInt(rating);
		if (feedback) updateData.feedback = feedback.trim();
		if (image !== undefined) updateData.image = image.trim();

		const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!testimonial) {
			return res.status(404).json({ message: "Testimonial not found" });
		}

		res.status(200).json({
			message: "Testimonial updated successfully",
			testimonial,
		});
	} catch (error) {
		console.error("Error updating testimonial:", error);
		res.status(500).json({ message: "Failed to update testimonial" });
	}
};

// Delete testimonial
const deleteTestimonial = async (req, res) => {
	try {
		const { id } = req.params;

		const testimonial = await Testimonial.findByIdAndDelete(id);

		if (!testimonial) {
			return res.status(404).json({ message: "Testimonial not found" });
		}

		res.status(200).json({ message: "Testimonial deleted successfully" });
	} catch (error) {
		console.error("Error deleting testimonial:", error);
		res.status(500).json({ message: "Failed to delete testimonial" });
	}
};

// Approve testimonial
const approveTestimonial = async (req, res) => {
	try {
		const { id } = req.params;

		const testimonial = await Testimonial.findByIdAndUpdate(
			id,
			{
				status: "approved",
				reviewedBy: req.user.id,
				reviewedAt: new Date(),
			},
			{ new: true }
		);

		if (!testimonial) {
			return res.status(404).json({ message: "Testimonial not found" });
		}

		res.status(200).json({
			message: "Testimonial approved successfully",
			testimonial,
		});
	} catch (error) {
		console.error("Error approving testimonial:", error);
		res.status(500).json({ message: "Failed to approve testimonial" });
	}
};

// Reject testimonial
const rejectTestimonial = async (req, res) => {
	try {
		const { id } = req.params;

		const testimonial = await Testimonial.findByIdAndUpdate(
			id,
			{
				status: "rejected",
				reviewedBy: req.user.id,
				reviewedAt: new Date(),
			},
			{ new: true }
		);

		if (!testimonial) {
			return res.status(404).json({ message: "Testimonial not found" });
		}

		res.status(200).json({
			message: "Testimonial rejected successfully",
			testimonial,
		});
	} catch (error) {
		console.error("Error rejecting testimonial:", error);
		res.status(500).json({ message: "Failed to reject testimonial" });
	}
};

export {
	getTestimonials,
	getAdminTestimonials,
	getTestimonialById,
	createTestimonial,
	updateTestimonial,
	deleteTestimonial,
	approveTestimonial,
	rejectTestimonial,
};
