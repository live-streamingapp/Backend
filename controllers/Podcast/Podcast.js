import Podcast from "../../model/PodcastModel.js";

// Create a podcast
export const addPodcast = async (req, res) => {
	try {
		const { title, url, description, category, tags } = req.body;
		const podcast = await Podcast.create({
			title,
			url,
			description,
			category,
			tags,
		});

		res.status(201).json({
			status: true,
			code: 201,
			message: "Podcast created successfully",
			data: podcast,
		});
	} catch (err) {
		console.error("Error creating podcast:", err);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to create podcast",
			error: err.message,
		});
	}
};

// Get all podcasts
export const getPodcasts = async (req, res) => {
	try {
		const podcasts = await Podcast.find().sort({ createdAt: -1 });

		res.status(200).json({
			status: true,
			code: 200,
			message: "Podcasts fetched successfully",
			count: podcasts.length,
			data: podcasts,
		});
	} catch (err) {
		console.error("Error fetching podcasts:", err);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to fetch podcasts",
			error: err.message,
		});
	}
};

// Get single podcast by ID
export const getPodcastById = async (req, res) => {
	try {
		const { id } = req.params;
		const podcast = await Podcast.findById(id);

		if (!podcast) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Podcast not found",
				data: null,
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Podcast fetched successfully",
			data: podcast,
		});
	} catch (err) {
		console.error("Error fetching podcast:", err);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to fetch podcast",
			error: err.message,
		});
	}
};

// Update a podcast
export const updatePodcast = async (req, res) => {
	try {
		const { id } = req.params;
		const podcast = await Podcast.findByIdAndUpdate(id, req.body, {
			new: true,
		});

		if (!podcast) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Podcast not found",
				data: null,
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Podcast updated successfully",
			data: podcast,
		});
	} catch (err) {
		console.error("Error updating podcast:", err);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to update podcast",
			error: err.message,
		});
	}
};

// Delete a podcast
export const deletePodcast = async (req, res) => {
	try {
		const { id } = req.params;
		const podcast = await Podcast.findByIdAndDelete(id);

		if (!podcast) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Podcast not found",
				data: null,
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Podcast deleted successfully",
			data: podcast,
		});
	} catch (err) {
		console.error("Error deleting podcast:", err);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to delete podcast",
			error: err.message,
		});
	}
};
