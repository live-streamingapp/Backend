import Cart from "../../model/CartModel.js";
import Course from "../../model/CourseModel.js";
import Book from "../../model/BookModel.js";
import Consultation from "../../model/ConsultationModel.js";
import Service from "../../model/ServiceModel.js";

export const addProduct = async (req, res) => {
	try {
		const {
			itemId,
			itemType, // 'Course', 'Book', 'Consultation', 'Service'
			quantity = 1,
			scheduledDate,
			scheduledTime,
			additionalInfo,
		} = req.body;
		const userId = req.user._id;

		if (!itemId || !itemType) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "itemId and itemType are required",
			});
		}

		// Validate itemType
		const validTypes = ["Course", "Book", "Consultation", "Service"];
		if (!validTypes.includes(itemType)) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "Invalid itemType",
			});
		}

		// Fetch item details
		let itemData;
		switch (itemType) {
			case "Course":
				itemData = await Course.findById(itemId);
				break;
			case "Book":
				itemData = await Book.findById(itemId);
				break;
			case "Consultation":
				itemData = await Consultation.findById(itemId);
				break;
			case "Service":
				itemData = await Service.findById(itemId);
				break;
		}

		if (!itemData) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: `${itemType} not found`,
			});
		}

		let cart = await Cart.findOne({ userId });

		const cartItem = {
			itemId,
			itemType,
			quantity,
			title: itemData.title || itemData.name,
			price: itemData.price,
			image: itemData.image || itemData.thumbnail,
		};

		if (scheduledDate) cartItem.scheduledDate = scheduledDate;
		if (scheduledTime) cartItem.scheduledTime = scheduledTime;
		if (additionalInfo) cartItem.additionalInfo = additionalInfo;

		if (!cart) {
			// Create new cart
			cart = new Cart({
				userId,
				items: [cartItem],
			});
		} else {
			// Filter out corrupted cart items (items without itemId or itemType)
			cart.items = cart.items.filter((item) => item.itemId && item.itemType);

			// Check if item exists
			const itemIndex = cart.items.findIndex(
				(item) =>
					item.itemId.toString() === itemId && item.itemType === itemType
			);

			if (itemIndex > -1) {
				// Update quantity
				cart.items[itemIndex].quantity += quantity;
				if (scheduledDate) cart.items[itemIndex].scheduledDate = scheduledDate;
				if (scheduledTime) cart.items[itemIndex].scheduledTime = scheduledTime;
			} else {
				// Add new item
				cart.items.push(cartItem);
			}
		}

		await cart.save();

		res.status(200).json({
			status: true,
			code: 200,
			message: "Item added to cart successfully",
			data: cart,
		});
	} catch (err) {
		console.error("Error adding item to cart:", err);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error adding item to cart",
			error: err.message,
		});
	}
};
