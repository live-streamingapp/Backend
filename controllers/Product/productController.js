import Product from "../../model/ProductModel.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
	try {
		const {
			category,
			isActive,
			isFeatured,
			minPrice,
			maxPrice,
			search,
			sortBy = "createdAt",
			order = "desc",
			limit = 50,
			page = 1,
		} = req.query;

		// Build filter object
		const filter = {};
		if (category) filter.category = category;
		if (isActive !== undefined) filter.isActive = isActive === "true";
		if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ productCode: { $regex: search, $options: "i" } },
			];
		}

		// Sort
		const sortOrder = order === "asc" ? 1 : -1;
		const sortObj = { [sortBy]: sortOrder };

		// Pagination
		const skip = (Number(page) - 1) * Number(limit);

		const products = await Product.find(filter)
			.sort(sortObj)
			.limit(Number(limit))
			.skip(skip);

		const total = await Product.countDocuments(filter);

		res.status(200).json({
			success: true,
			count: products.length,
			total,
			page: Number(page),
			pages: Math.ceil(total / Number(limit)),
			data: products,
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error: error.message,
		});
	}
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		console.error("Error fetching product:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product",
			error: error.message,
		});
	}
};

// @desc    Get product by product code
// @route   GET /api/products/code/:code
// @access  Public
export const getProductByCode = async (req, res) => {
	try {
		const product = await Product.findOne({ productCode: req.params.code });

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		console.error("Error fetching product:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product",
			error: error.message,
		});
	}
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
	try {
		// Handle image uploads if files are present
		const images = [];

		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				try {
					// Upload to Cloudinary
					const result = await cloudinary.uploader.upload(file.path, {
						folder: "products",
						transformation: [
							{ width: 800, height: 800, crop: "limit" },
							{ quality: "auto" },
						],
					});

					images.push({
						url: result.secure_url,
						alt: req.body.title || "Product image",
					});

					// Delete local file after upload
					fs.unlinkSync(file.path);
				} catch (uploadError) {
					console.error("Error uploading image:", uploadError);
					// Continue with other images even if one fails
				}
			}
		}

		// Create product data object
		const productData = {
			...req.body,
			images: images.length > 0 ? images : req.body.images || [],
		};

		const product = await Product.create(productData);

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: product,
		});
	} catch (error) {
		console.error("Error creating product:", error);

		// Clean up uploaded files in case of error
		if (req.files) {
			req.files.forEach((file) => {
				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}
			});
		}

		res.status(400).json({
			success: false,
			message: "Failed to create product",
			error: error.message,
		});
	}
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Handle image uploads if new files are present
		const images = [...(product.images || [])];

		if (req.files && req.files.length > 0) {
			// If new images are uploaded, replace existing ones
			const newImages = [];

			for (const file of req.files) {
				try {
					// Upload to Cloudinary
					const result = await cloudinary.uploader.upload(file.path, {
						folder: "products",
						transformation: [
							{ width: 800, height: 800, crop: "limit" },
							{ quality: "auto" },
						],
					});

					newImages.push({
						url: result.secure_url,
						alt: req.body.title || product.title || "Product image",
					});

					// Delete local file after upload
					fs.unlinkSync(file.path);
				} catch (uploadError) {
					console.error("Error uploading image:", uploadError);
				}
			}

			// Replace images array with new ones
			req.body.images = newImages.length > 0 ? newImages : images;
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: updatedProduct,
		});
	} catch (error) {
		console.error("Error updating product:", error);

		// Clean up uploaded files in case of error
		if (req.files) {
			req.files.forEach((file) => {
				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}
			});
		}

		res.status(400).json({
			success: false,
			message: "Failed to update product",
			error: error.message,
		});
	}
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findByIdAndDelete(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete product",
			error: error.message,
		});
	}
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = async (req, res) => {
	try {
		const { rating, comment, userName, userId } = req.body;

		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		product.reviews.push({
			userId,
			userName,
			rating,
			comment,
		});

		product.updateRating();
		await product.save();

		res.status(201).json({
			success: true,
			message: "Review added successfully",
			data: product,
		});
	} catch (error) {
		console.error("Error adding review:", error);
		res.status(400).json({
			success: false,
			message: "Failed to add review",
			error: error.message,
		});
	}
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Admin
export const getProductStats = async (req, res) => {
	try {
		const totalProducts = await Product.countDocuments();
		const activeProducts = await Product.countDocuments({ isActive: true });
		const featuredProducts = await Product.countDocuments({ isFeatured: true });
		const outOfStock = await Product.countDocuments({ quantity: 0 });

		const categoryStats = await Product.aggregate([
			{
				$group: {
					_id: "$category",
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
					totalQuantity: { $sum: "$quantity" },
				},
			},
		]);

		res.status(200).json({
			success: true,
			data: {
				totalProducts,
				activeProducts,
				featuredProducts,
				outOfStock,
				categoryStats,
			},
		});
	} catch (error) {
		console.error("Error fetching product stats:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product statistics",
			error: error.message,
		});
	}
};
