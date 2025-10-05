import Service from "../../model/ServiceModel.js";

export const deleteService = async (req, res) => {
	try {
		const { id } = req.params;

		const service = await Service.findByIdAndDelete(id);

		if (!service) {
			return res.status(404).json({
				success: false,
				message: "Service not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Service deleted successfully",
		});
	} catch (error) {
		console.error("Delete service error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete service",
			error: error.message,
		});
	}
};
