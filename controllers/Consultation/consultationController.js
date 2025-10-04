import Consultation from "../../model/ConsultationModel.js";

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Admin
export const getAllConsultations = async (req, res) => {
	try {
		const { status, date, instructor } = req.query;

		// Build filter object
		const filter = {};
		if (status) filter.status = status;
		if (date) {
			const startDate = new Date(date);
			const endDate = new Date(date);
			endDate.setDate(endDate.getDate() + 1);
			filter["consultationDetails.date"] = {
				$gte: startDate,
				$lt: endDate,
			};
		}
		if (instructor) filter["instructor.name"] = new RegExp(instructor, "i");

		const consultations = await Consultation.find(filter).sort({
			"consultationDetails.date": -1,
		});

		res.status(200).json({
			success: true,
			count: consultations.length,
			data: consultations,
		});
	} catch (error) {
		console.error("Error fetching consultations:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch consultations",
			error: error.message,
		});
	}
};

// @desc    Get single consultation by ID
// @route   GET /api/consultations/:id
// @access  Admin
export const getConsultationById = async (req, res) => {
	try {
		const consultation = await Consultation.findById(req.params.id);

		if (!consultation) {
			return res.status(404).json({
				success: false,
				message: "Consultation not found",
			});
		}

		res.status(200).json({
			success: true,
			data: consultation,
		});
	} catch (error) {
		console.error("Error fetching consultation:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch consultation",
			error: error.message,
		});
	}
};

// @desc    Create new consultation
// @route   POST /api/consultations
// @access  Admin
export const createConsultation = async (req, res) => {
	try {
		const consultation = await Consultation.create(req.body);

		res.status(201).json({
			success: true,
			message: "Consultation created successfully",
			data: consultation,
		});
	} catch (error) {
		console.error("Error creating consultation:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create consultation",
			error: error.message,
		});
	}
};

// @desc    Update consultation
// @route   PUT /api/consultations/:id
// @access  Admin
export const updateConsultation = async (req, res) => {
	try {
		const consultation = await Consultation.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!consultation) {
			return res.status(404).json({
				success: false,
				message: "Consultation not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Consultation updated successfully",
			data: consultation,
		});
	} catch (error) {
		console.error("Error updating consultation:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update consultation",
			error: error.message,
		});
	}
};

// Note: assignAstrologer function removed - single astrologer model

// @desc    Delete consultation
// @route   DELETE /api/consultations/:id
// @access  Admin
export const deleteConsultation = async (req, res) => {
	try {
		const consultation = await Consultation.findByIdAndDelete(req.params.id);

		if (!consultation) {
			return res.status(404).json({
				success: false,
				message: "Consultation not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Consultation deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting consultation:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete consultation",
			error: error.message,
		});
	}
};

// @desc    Get consultation statistics
// @route   GET /api/consultations/stats
// @access  Admin
export const getConsultationStats = async (req, res) => {
	try {
		const totalConsultations = await Consultation.countDocuments();
		const paidConsultations = await Consultation.countDocuments({
			status: "paid",
		});
		const pendingConsultations = await Consultation.countDocuments({
			status: "pending",
		});
		const completedConsultations = await Consultation.countDocuments({
			status: "completed",
		});

		res.status(200).json({
			success: true,
			data: {
				total: totalConsultations,
				paid: paidConsultations,
				pending: pendingConsultations,
				completed: completedConsultations,
			},
		});
	} catch (error) {
		console.error("Error fetching consultation stats:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch consultation statistics",
			error: error.message,
		});
	}
};
