// DEPRECATED: This legacy seeder is disabled. Use exportStaticData/importStaticData instead.
if (process.env.ALLOW_LEGACY_SEED !== "true") {
	console.error(
		"[DEPRECATED] scripts/seedOrders.js is disabled. Use export:static/import:static."
	);
	process.exit(1);
}

import mongoose from "mongoose";
import Order from "../model/OrderModel.js";
import User from "../model/UserModel.js";
import Book from "../model/BookModel.js";
import Service from "../model/ServiceModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Helper function to generate random dates
const randomDate = (start, end) => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

// Helper to get random item from array
const getRandomItem = (array) =>
	array[Math.floor(Math.random() * array.length)];

// Order statuses with progression
const orderStatuses = [
	"pending",
	"declined",
	"accepted",
	"completed",
	"cancelled",
];
const paymentStatuses = ["pending", "paid", "failed"];
const paymentMethods = ["card", "upi", "netbanking", "wallet", "cod"];

const seedOrders = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log("✅ Connected to MongoDB");

		// Find admin user
		const admin = await User.findOne({
			email: "antilaman3113@gmail.com",
			role: "astrologer",
		});
		if (!admin) {
			console.log(
				"❌ No admin user found. Please run seed:admin first or check user exists."
			);
			process.exit(1);
		}

		// Find or create some students
		let students = await User.find({ role: "student" }).limit(5);

		if (students.length < 3) {
			console.log("💡 Creating sample students for orders...");
			const sampleStudents = [
				{
					name: "Rajesh Kumar",
					email: "rajesh.kumar@example.com",
					phone: "9876543210",
					dob: { day: 15, month: 8, year: 1990 },
					password: "hashedpassword123",
					role: "student",
				},
				{
					name: "Priya Sharma",
					email: "priya.sharma@example.com",
					phone: "9876543211",
					dob: { day: 22, month: 3, year: 1992 },
					password: "hashedpassword123",
					role: "student",
				},
				{
					name: "Amit Patel",
					email: "amit.patel@example.com",
					phone: "9876543212",
					dob: { day: 10, month: 12, year: 1988 },
					password: "hashedpassword123",
					role: "student",
				},
				{
					name: "Sneha Reddy",
					email: "sneha.reddy@example.com",
					phone: "9876543213",
					dob: { day: 5, month: 6, year: 1995 },
					password: "hashedpassword123",
					role: "student",
				},
				{
					name: "Vikram Singh",
					email: "vikram.singh@example.com",
					phone: "9876543214",
					dob: { day: 18, month: 9, year: 1987 },
					password: "hashedpassword123",
					role: "student",
				},
			];

			const createdStudents = await User.insertMany(sampleStudents);
			students = [...students, ...createdStudents];
			console.log(`✅ Created ${createdStudents.length} sample students`);
		}

		// Fetch available books and services
		const books = await Book.find().limit(5);
		const services = await Service.find({ isActive: true }).limit(10);

		if (books.length === 0 && services.length === 0) {
			console.log(
				"❌ No books or services found. Please seed books/services first."
			);
			process.exit(1);
		}

		// Clear existing orders
		await Order.deleteMany({});
		console.log("🗑️  Cleared existing orders");

		const orders = [];
		const now = new Date();
		const threeMonthsAgo = new Date(now);
		threeMonthsAgo.setMonth(now.getMonth() - 3);

		// Create 20 diverse orders
		for (let i = 0; i < 20; i++) {
			const user = getRandomItem(students);
			const orderDate = randomDate(threeMonthsAgo, now);
			const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
			const items = [];
			let totalAmount = 0;

			// Add random items to order
			for (let j = 0; j < itemCount; j++) {
				const itemType = Math.random() > 0.5 ? "service" : "book";

				if (itemType === "service" && services.length > 0) {
					const service = getRandomItem(services);
					const price = service.price || 0;
					totalAmount += price;

					items.push({
						itemType:
							service.serviceType === "consultation"
								? "package"
								: service.serviceType,
						itemId: service._id,
						itemModel: "Service",
						title: service.title,
						price: price,
						quantity: 1,
						image: service.image,
						packageDetails: {
							consultationType: service.category,
							duration: 60,
							meetingMode: getRandomItem(["online", "in-person", "phone"]),
							scheduledDate: randomDate(
								orderDate,
								new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000)
							),
							scheduledTime: getRandomItem([
								"10:00 AM",
								"2:00 PM",
								"4:00 PM",
								"6:00 PM",
							]),
						},
					});
				} else if (itemType === "book" && books.length > 0) {
					const book = getRandomItem(books);
					const price = book.price || 0;
					const quantity = Math.floor(Math.random() * 2) + 1;
					totalAmount += price * quantity;

					items.push({
						itemType: "book",
						itemId: book._id,
						itemModel: "Book",
						title: book.title,
						price: price,
						quantity: quantity,
						image: book.coverImage,
						bookDetails: {
							author: "Vastu Guru Abhishek Goel",
							pages: Math.floor(Math.random() * 200) + 100,
						},
					});
				}
			}

			// Determine order status based on date
			let status, paymentStatus;
			const daysSinceOrder = Math.floor(
				(now - orderDate) / (1000 * 60 * 60 * 24)
			);

			if (daysSinceOrder > 30) {
				status = Math.random() > 0.1 ? "completed" : "cancelled";
				paymentStatus = status === "completed" ? "paid" : "refunded";
			} else if (daysSinceOrder > 7) {
				status = getRandomItem(["accepted", "completed", "cancelled"]);
				paymentStatus = status === "cancelled" ? "refunded" : "paid";
			} else {
				status = getRandomItem(["pending", "accepted"]);
				paymentStatus = getRandomItem(["pending", "paid"]);
			}

			const paymentMethod = getRandomItem(paymentMethods);
			const hasShipping = items.some((item) => item.itemType === "book");

			const order = {
				orderNumber: `ORD${Date.now()}${String(i + 1).padStart(4, "0")}`,
				user: user._id,
				items: items,
				totalAmount: totalAmount,
				status: status,
				paymentMethod: paymentMethod,
				paymentStatus: paymentStatus,
				transactionId:
					paymentStatus === "paid" ? `TXN${Date.now()}${i}` : undefined,
				paidAt: paymentStatus === "paid" ? orderDate : undefined,
				shippingAddress: hasShipping
					? {
							name: user.name,
							phone: user.phone,
							addressLine1: `${
								Math.floor(Math.random() * 999) + 1
							}, ${getRandomItem([
								"MG Road",
								"Park Street",
								"Gandhi Nagar",
								"Nehru Place",
								"Rajiv Chowk",
							])}`,
							addressLine2: getRandomItem([
								"Near Metro Station",
								"Opposite City Mall",
								"Behind Park",
								"",
							]),
							city: getRandomItem([
								"Mumbai",
								"Delhi",
								"Bangalore",
								"Chennai",
								"Kolkata",
								"Hyderabad",
								"Pune",
								"Ahmedabad",
							]),
							state: getRandomItem([
								"Maharashtra",
								"Delhi",
								"Karnataka",
								"Tamil Nadu",
								"West Bengal",
								"Telangana",
								"Gujarat",
							]),
							pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
							country: "India",
					  }
					: undefined,
				statusHistory: [
					{
						status: status,
						updatedBy: admin._id,
						timestamp: orderDate,
						notes:
							status === "cancelled"
								? "Customer requested cancellation"
								: status === "completed"
								? "Order completed successfully"
								: "Order placed successfully",
					},
				],
				trackingNumber:
					hasShipping && status !== "pending"
						? `TRACK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
						: undefined,
				deliveredAt:
					status === "completed" && hasShipping
						? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
						: undefined,
				createdAt: orderDate,
				updatedAt: orderDate,
			};

			orders.push(order);
		}

		// Insert all orders
		const insertedOrders = await Order.insertMany(orders);
		console.log(`✅ Successfully seeded ${insertedOrders.length} orders`);

		// Summary
		const statusCounts = await Order.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } },
		]);

		const paymentCounts = await Order.aggregate([
			{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
		]);

		console.log("\n📊 Summary:");
		console.log(`   • Total Orders: ${insertedOrders.length}`);
		console.log("\n💡 Orders by Status:");
		statusCounts.forEach((item) => {
			console.log(`   • ${item._id}: ${item.count}`);
		});
		console.log("\n💳 Payment Status:");
		paymentCounts.forEach((item) => {
			console.log(`   • ${item._id}: ${item.count}`);
		});

		// Calculate total revenue
		const revenue = await Order.aggregate([
			{ $match: { paymentStatus: "paid" } },
			{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
		]);

		if (revenue.length > 0) {
			console.log(
				`\n💰 Total Revenue: ₹${revenue[0].total.toLocaleString("en-IN")}`
			);
		}

		await mongoose.connection.close();
		console.log("\n🎉 Order seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error seeding orders:", error);
		process.exit(1);
	}
};

seedOrders();
