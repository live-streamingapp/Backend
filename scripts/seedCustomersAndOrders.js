import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../model/UserModel.js";
import Product from "../model/ProductModel.js";
import ProductOrder from "../model/ProductOrderModel.js";
import connectDB from "../config/db.js";

dotenv.config();

// Sample customer data
const sampleCustomers = [
	{
		name: "Rajesh Kumar",
		email: "rajesh.kumar@example.com",
		phone: "9876543210",
		dob: { day: 15, month: 3, year: 1985 },
		password: "password123",
		role: "student",
	},
	{
		name: "Priya Sharma",
		email: "priya.sharma@example.com",
		phone: "9876543211",
		dob: { day: 22, month: 7, year: 1990 },
		password: "password123",
		role: "student",
	},
	{
		name: "Amit Patel",
		email: "amit.patel@example.com",
		phone: "9876543212",
		dob: { day: 8, month: 12, year: 1988 },
		password: "password123",
		role: "student",
	},
	{
		name: "Sneha Reddy",
		email: "sneha.reddy@example.com",
		phone: "9876543213",
		dob: { day: 30, month: 5, year: 1992 },
		password: "password123",
		role: "student",
	},
	{
		name: "Vikram Singh",
		email: "vikram.singh@example.com",
		phone: "9876543214",
		dob: { day: 18, month: 9, year: 1987 },
		password: "password123",
		role: "student",
	},
	{
		name: "Anjali Gupta",
		email: "anjali.gupta@example.com",
		phone: "9876543215",
		dob: { day: 25, month: 11, year: 1995 },
		password: "password123",
		role: "student",
	},
	{
		name: "Karthik Iyer",
		email: "karthik.iyer@example.com",
		phone: "9876543216",
		dob: { day: 12, month: 2, year: 1989 },
		password: "password123",
		role: "student",
	},
	{
		name: "Deepika Nair",
		email: "deepika.nair@example.com",
		phone: "9876543217",
		dob: { day: 5, month: 8, year: 1993 },
		password: "password123",
		role: "student",
	},
	{
		name: "Arjun Verma",
		email: "arjun.verma@example.com",
		phone: "9876543218",
		dob: { day: 28, month: 4, year: 1991 },
		password: "password123",
		role: "student",
	},
	{
		name: "Meera Joshi",
		email: "meera.joshi@example.com",
		phone: "9876543219",
		dob: { day: 14, month: 10, year: 1994 },
		password: "password123",
		role: "student",
	},
];

// Function to generate random date within last 6 months
const randomDate = (start, end) => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
};

// Function to generate order ID
const generateOrderId = () => {
	return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const seedCustomersAndOrders = async () => {
	try {
		await connectDB();

		console.log("🔄 Starting seed process...\n");

		// Clear existing data
		const deletedUsers = await User.deleteMany({ role: "student" });
		const deletedOrders = await ProductOrder.deleteMany({});
		console.log(`🗑️  Cleared ${deletedUsers.deletedCount} existing customers`);
		console.log(`🗑️  Cleared ${deletedOrders.deletedCount} existing orders\n`);

		// Hash password for all customers
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("password123", salt);

		// Create customers with hashed password
		const customersWithHashedPwd = sampleCustomers.map((customer) => ({
			...customer,
			password: hashedPassword,
		}));

		const customers = await User.insertMany(customersWithHashedPwd);
		console.log(`✅ ${customers.length} customers created\n`);

		// Get all products
		const products = await Product.find({ isActive: true }).limit(8);
		if (products.length === 0) {
			console.log(
				"⚠️  No products found. Please run 'npm run seed:products' first"
			);
			process.exit(1);
		}
		console.log(`📦 Found ${products.length} products\n`);

		// Create orders for customers
		const orders = [];
		const orderStatuses = [
			"Order Placed",
			"Order Confirmed",
			"Order Shipped",
			"Out for Delivery",
			"Order Delivered",
		];
		const paymentMethods = ["Credit Card", "Debit Card", "UPI", "Net Banking"];
		const cities = [
			"Mumbai",
			"Delhi",
			"Bangalore",
			"Hyderabad",
			"Chennai",
			"Pune",
			"Kolkata",
			"Ahmedabad",
		];
		const states = [
			"Maharashtra",
			"Delhi",
			"Karnataka",
			"Telangana",
			"Tamil Nadu",
			"Maharashtra",
			"West Bengal",
			"Gujarat",
		];

		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
		const today = new Date();

		// Generate 2-4 orders per customer
		for (const customer of customers) {
			const numOrders = Math.floor(Math.random() * 3) + 2; // 2-4 orders

			for (let i = 0; i < numOrders; i++) {
				const product = products[Math.floor(Math.random() * products.length)];
				const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
				const orderDate = randomDate(sixMonthsAgo, today);
				const status =
					orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

				// Calculate delivery date for delivered orders
				let deliveryDate = null;
				if (status === "Order Delivered") {
					deliveryDate = new Date(orderDate);
					deliveryDate.setDate(
						deliveryDate.getDate() + Math.floor(Math.random() * 7) + 3
					); // 3-10 days after order
				}

				const cityIndex = Math.floor(Math.random() * cities.length);
				const order = {
					orderId: generateOrderId(),
					customer: {
						customerId: customer._id.toString(),
						customerName: customer.name,
						phone: customer.phone,
						email: customer.email,
						userId: customer._id,
					},
					product: {
						productId: product._id,
						title: product.title,
						category: product.category,
						quantity: quantity,
						price: product.price,
						image: product.images[0]?.url || "/images/placeholder.png",
					},
					shipping: {
						addressLines: [
							`${Math.floor(Math.random() * 999) + 1}, ${
								[
									"MG Road",
									"Main Street",
									"Park Avenue",
									"Gandhi Nagar",
									"Residency Road",
								][Math.floor(Math.random() * 5)]
							}`,
						],
						city: cities[cityIndex],
						state: states[cityIndex],
						pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
						country: "India",
					},
					payment: {
						amount: product.price * quantity,
						currency: "INR",
						paymentMethod:
							paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
						transactionId: `TXN${Date.now()}${Math.floor(
							Math.random() * 10000
						)}`,
						paymentStatus: "paid",
					},
					orderStatus: status,
					tracking: {
						steps: [
							{
								label: "Order Placed",
								date: orderDate,
								completed: true,
							},
							{
								label: "Order Confirmed",
								date: orderDate,
								completed: orderStatuses.indexOf(status) >= 1,
							},
							{
								label: "Order Shipped",
								date:
									orderStatuses.indexOf(status) >= 2
										? new Date(orderDate.getTime() + 86400000)
										: null,
								completed: orderStatuses.indexOf(status) >= 2,
							},
							{
								label: "Out for Delivery",
								date:
									orderStatuses.indexOf(status) >= 3
										? new Date(orderDate.getTime() + 172800000)
										: null,
								completed: orderStatuses.indexOf(status) >= 3,
							},
							{
								label: "Order Delivered",
								date: deliveryDate,
								completed: orderStatuses.indexOf(status) >= 4,
							},
						],
						currentStep: orderStatuses.indexOf(status),
					},
					orderDate: orderDate,
					deliveryDate: deliveryDate,
					rating: {
						value:
							status === "Order Delivered"
								? Math.floor(Math.random() * 2) + 4
								: 0, // 4-5 stars for delivered
						reviews: status === "Order Delivered" ? 1 : 0,
					},
				};

				orders.push(order);
			}
		}

		const createdOrders = await ProductOrder.insertMany(orders);
		console.log(`✅ ${createdOrders.length} orders created\n`);

		// Display summary
		console.log("📊 Seeding Summary:");
		console.log(`   👥 Total Customers: ${customers.length}`);
		console.log(`   📦 Total Orders: ${createdOrders.length}`);
		console.log(
			`   💰 Total Revenue: ₹${createdOrders.reduce(
				(sum, order) => sum + order.payment.amount,
				0
			)}`
		);

		console.log("\n📋 Order Status Distribution:");
		const statusCount = {};
		createdOrders.forEach((order) => {
			statusCount[order.orderStatus] =
				(statusCount[order.orderStatus] || 0) + 1;
		});
		Object.entries(statusCount).forEach(([status, count]) => {
			console.log(`   - ${status}: ${count}`);
		});

		console.log("\n👤 Sample Customer Credentials:");
		console.log("   Email: rajesh.kumar@example.com");
		console.log("   Password: password123");
		console.log("\n   (All customers have the same password: password123)\n");

		console.log("✨ Seeding completed successfully!\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding data:", error);
		process.exit(1);
	}
};

seedCustomersAndOrders();
