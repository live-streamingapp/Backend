import Order from "../../model/OrderModel.js";
import Cart from "../../model/CartModel.js";
import Course from "../../model/CourseModel.js";
import Book from "../../model/BookModel.js";
import Consultation from "../../model/ConsultationModel.js";
import Service from "../../model/ServiceModel.js";

export const createOrder = async (req, res) => {
	try {
		const userId = req.user._id;
		const {
			items, // Array of {itemId, itemType, quantity, scheduledDate, scheduledTime}
			shippingAddress,
			paymentMethod,
			notes,
		} = req.body;

		if (!items || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No items provided",
			});
		}

		// Fetch and validate all items
		const orderItems = [];
		let totalAmount = 0;

		for (const item of items) {
			let itemData;
			let itemModel;

			switch (item.itemType) {
				case "course":
					itemData = await Course.findById(item.itemId).populate("instructor");
					itemModel = "Course";
					break;
				case "book":
					itemData = await Book.findById(item.itemId);
					itemModel = "Book";
					break;
				case "package":
					itemData = await Consultation.findById(item.itemId);
					itemModel = "Consultation";
					break;
				case "service":
					itemData = await Service.findById(item.itemId);
					itemModel = "Service";
					break;
				default:
					continue;
			}

			if (!itemData) {
				return res.status(404).json({
					success: false,
					message: `${item.itemType} not found`,
				});
			}

			const orderItem = {
				itemType: item.itemType,
				itemId: item.itemId,
				itemModel,
				title: itemData.title || itemData.name,
				price: itemData.price,
				quantity: item.quantity || 1,
				image: itemData.image || itemData.thumbnail,
			};

			// Add type-specific details
			if (item.itemType === "course") {
				orderItem.courseDetails = {
					duration: itemData.duration,
					lessons: itemData.lessons,
					instructor: itemData.instructor?._id,
				};
			} else if (item.itemType === "book") {
				orderItem.bookDetails = {
					author: itemData.author,
					isbn: itemData.isbn,
					pages: itemData.pages,
				};
			} else if (item.itemType === "package") {
				orderItem.packageDetails = {
					consultationType: itemData.type,
					duration: itemData.duration,
					meetingMode: item.meetingMode || "online",
					scheduledDate: item.scheduledDate,
					scheduledTime: item.scheduledTime,
				};
			} else if (item.itemType === "service") {
				orderItem.serviceDetails = {
					serviceType: itemData.serviceType,
					deliveryTime: itemData.deliveryTime,
					specifications: itemData.features,
				};
			}

			orderItems.push(orderItem);
			totalAmount += itemData.price * (item.quantity || 1);
		}

		// Create order
		const order = await Order.create({
			user: userId,
			items: orderItems,
			totalAmount,
			shippingAddress,
			paymentMethod,
			notes,
			statusHistory: [
				{
					status: "pending",
					updatedBy: userId,
					timestamp: new Date(),
				},
			],
		});

		// Clear cart if items are from cart
		if (req.body.clearCart) {
			await Cart.findOneAndUpdate({ userId }, { items: [] });
		}

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: order,
		});
	} catch (error) {
		console.error("Create order error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create order",
			error: error.message,
		});
	}
};
