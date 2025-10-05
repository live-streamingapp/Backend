import Service from "../../model/ServiceModel.js";

export const getServices = async (req, res) => {
	try {
		const {
			category,
			serviceType,
			subCategory,
			minPrice,
			maxPrice,
			isActive,
			page = 1,
			limit = 10,
		} = req.query;

		const filter = {};

		if (category) filter.category = category;
		if (serviceType) filter.serviceType = serviceType;
		if (subCategory) {
			filter.subCategory = { $regex: subCategory, $options: "i" };
		}
		if (isActive !== undefined) filter.isActive = isActive === "true";
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}

		const skip = (Number(page) - 1) * Number(limit);

		const services = await Service.find(filter)
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));

		const total = await Service.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: services,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		console.error("Get services error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch services",
			error: error.message,
		});
	}
};

export const getServiceById = async (req, res) => {
	try {
		const { id } = req.params;

		const service = await Service.findById(id).populate(
			"createdBy",
			"name email"
		);

		if (!service) {
			return res.status(404).json({
				success: false,
				message: "Service not found",
			});
		}

		res.status(200).json({
			success: true,
			data: service,
		});
	} catch (error) {
		console.error("Get service by ID error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch service",
			error: error.message,
		});
	}
};
