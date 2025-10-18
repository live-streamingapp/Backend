// DEPRECATED: This legacy seeder is disabled. Use exportStaticData/importStaticData instead.
if (process.env.ALLOW_LEGACY_SEED !== "true") {
	console.error(
		"[DEPRECATED] scripts/seedTickets.js is disabled. Use export:static/import:static."
	);
	process.exit(1);
}

import mongoose from "mongoose";
import dotenv from "dotenv";
import TicketModel from "../model/TicketModel.js";
import connectDB from "../config/db.js";

dotenv.config();

const sampleTickets = [
	{
		eventTitle: "Vedic Astrology Masterclass 2025",
		eventDate: new Date("2025-11-15T10:00:00"),
		time: "10:00 AM - 5:00 PM",
		venue: "Grand Auditorium, New Delhi",
		ticketType: "VIP",
		quantity: 2,
		amount: 4999,
		paymentStatus: "Paid",
		qrCodeData: "VIP-ASTRO-2025-001",
	},
	{
		eventTitle: "Vedic Astrology Masterclass 2025",
		eventDate: new Date("2025-11-15T10:00:00"),
		time: "10:00 AM - 5:00 PM",
		venue: "Grand Auditorium, New Delhi",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 1999,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-ASTRO-2025-002",
	},
	{
		eventTitle: "Numerology Workshop",
		eventDate: new Date("2025-10-20T14:00:00"),
		time: "2:00 PM - 6:00 PM",
		venue: "Wisdom Center, Mumbai",
		ticketType: "NORMAL",
		quantity: 3,
		amount: 4500,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-NUMERO-2025-003",
	},
	{
		eventTitle: "Vastu Shastra Seminar",
		eventDate: new Date("2025-12-05T09:00:00"),
		time: "9:00 AM - 4:00 PM",
		venue: "Convention Hall, Bangalore",
		ticketType: "VIP",
		quantity: 1,
		amount: 3999,
		paymentStatus: "Paid",
		qrCodeData: "VIP-VASTU-2025-004",
	},
	{
		eventTitle: "Vastu Shastra Seminar",
		eventDate: new Date("2025-12-05T09:00:00"),
		time: "9:00 AM - 4:00 PM",
		venue: "Convention Hall, Bangalore",
		ticketType: "NORMAL",
		quantity: 2,
		amount: 2998,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-VASTU-2025-005",
	},
	{
		eventTitle: "Tarot Reading Certification Course",
		eventDate: new Date("2025-11-28T10:00:00"),
		time: "10:00 AM - 6:00 PM",
		venue: "Spiritual Academy, Pune",
		ticketType: "VIP",
		quantity: 1,
		amount: 5999,
		paymentStatus: "Paid",
		qrCodeData: "VIP-TAROT-2025-006",
	},
	{
		eventTitle: "Full Moon Meditation & Healing",
		eventDate: new Date("2025-10-28T18:00:00"),
		time: "6:00 PM - 9:00 PM",
		venue: "Serenity Gardens, Goa",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 0,
		paymentStatus: "Free",
		qrCodeData: "FREE-MEDITATION-2025-007",
	},
	{
		eventTitle: "Full Moon Meditation & Healing",
		eventDate: new Date("2025-10-28T18:00:00"),
		time: "6:00 PM - 9:00 PM",
		venue: "Serenity Gardens, Goa",
		ticketType: "NORMAL",
		quantity: 2,
		amount: 0,
		paymentStatus: "Free",
		qrCodeData: "FREE-MEDITATION-2025-008",
	},
	{
		eventTitle: "Palmistry & Hand Analysis Workshop",
		eventDate: new Date("2025-11-10T11:00:00"),
		time: "11:00 AM - 5:00 PM",
		venue: "Learning Center, Jaipur",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 1499,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-PALM-2025-009",
	},
	{
		eventTitle: "Kundalini Awakening Retreat",
		eventDate: new Date("2025-12-15T08:00:00"),
		time: "8:00 AM - 8:00 PM",
		venue: "Himalayan Retreat Center, Rishikesh",
		ticketType: "VIP",
		quantity: 1,
		amount: 12999,
		paymentStatus: "Paid",
		qrCodeData: "VIP-KUNDALINI-2025-010",
	},
	{
		eventTitle: "Gemstone & Crystal Healing Session",
		eventDate: new Date("2025-10-25T15:00:00"),
		time: "3:00 PM - 6:00 PM",
		venue: "Wellness Hub, Hyderabad",
		ticketType: "NORMAL",
		quantity: 2,
		amount: 1998,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-GEMSTONE-2025-011",
	},
	{
		eventTitle: "Chakra Balancing Workshop",
		eventDate: new Date("2025-11-05T10:00:00"),
		time: "10:00 AM - 4:00 PM",
		venue: "Yoga Studio, Chennai",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 1299,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-CHAKRA-2025-012",
	},
	{
		eventTitle: "Annual Astrology Conference 2025",
		eventDate: new Date("2025-12-20T09:00:00"),
		time: "9:00 AM - 7:00 PM",
		venue: "International Convention Center, Delhi",
		ticketType: "VIP",
		quantity: 2,
		amount: 9998,
		paymentStatus: "Paid",
		qrCodeData: "VIP-CONF-2025-013",
	},
	{
		eventTitle: "Annual Astrology Conference 2025",
		eventDate: new Date("2025-12-20T09:00:00"),
		time: "9:00 AM - 7:00 PM",
		venue: "International Convention Center, Delhi",
		ticketType: "NORMAL",
		quantity: 5,
		amount: 12495,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-CONF-2025-014",
	},
	{
		eventTitle: "Spiritual Awakening Webinar",
		eventDate: new Date("2025-10-18T19:00:00"),
		time: "7:00 PM - 9:00 PM",
		venue: "Online Event",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 0,
		paymentStatus: "Free",
		qrCodeData: "FREE-WEBINAR-2025-015",
	},
	{
		eventTitle: "Rudraksha Energization Ceremony",
		eventDate: new Date("2025-11-22T06:00:00"),
		time: "6:00 AM - 10:00 AM",
		venue: "Sacred Temple, Varanasi",
		ticketType: "VIP",
		quantity: 1,
		amount: 2999,
		paymentStatus: "Paid",
		qrCodeData: "VIP-RUDRAKSHA-2025-016",
	},
	{
		eventTitle: "Feng Shui for Home & Office",
		eventDate: new Date("2025-11-18T14:00:00"),
		time: "2:00 PM - 5:00 PM",
		venue: "Design Studio, Kolkata",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 1799,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-FENGSHUI-2025-017",
	},
	{
		eventTitle: "Past Life Regression Therapy",
		eventDate: new Date("2025-12-08T11:00:00"),
		time: "11:00 AM - 3:00 PM",
		venue: "Healing Center, Ahmedabad",
		ticketType: "VIP",
		quantity: 1,
		amount: 4499,
		paymentStatus: "Paid",
		qrCodeData: "VIP-PASTLIFE-2025-018",
	},
	{
		eventTitle: "Reiki Level 1 Certification",
		eventDate: new Date("2025-11-25T10:00:00"),
		time: "10:00 AM - 6:00 PM",
		venue: "Wellness Institute, Chandigarh",
		ticketType: "NORMAL",
		quantity: 1,
		amount: 3999,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-REIKI-2025-019",
	},
	{
		eventTitle: "Sound Healing & Meditation",
		eventDate: new Date("2025-10-30T17:00:00"),
		time: "5:00 PM - 8:00 PM",
		venue: "Meditation Hall, Mysore",
		ticketType: "NORMAL",
		quantity: 2,
		amount: 1498,
		paymentStatus: "Paid",
		qrCodeData: "NORMAL-SOUND-2025-020",
	},
];

const seedTickets = async () => {
	try {
		await connectDB();

		// Clear existing tickets
		await TicketModel.deleteMany({});
		console.log("Existing tickets cleared");

		// Insert sample tickets
		const tickets = await TicketModel.insertMany(sampleTickets);
		console.log(`✅ ${tickets.length} tickets seeded successfully`);

		// Display summary
		console.log("\n🎫 Tickets Summary:");
		const summary = {};

		tickets.forEach((ticket) => {
			if (!summary[ticket.eventTitle]) {
				summary[ticket.eventTitle] = {
					vip: 0,
					normal: 0,
					totalAmount: 0,
				};
			}
			if (ticket.ticketType === "VIP") {
				summary[ticket.eventTitle].vip += ticket.quantity;
			} else {
				summary[ticket.eventTitle].normal += ticket.quantity;
			}
			summary[ticket.eventTitle].totalAmount += ticket.amount;
		});

		Object.entries(summary).forEach(([event, data]) => {
			console.log(`\n   📅 ${event}`);
			console.log(`      VIP: ${data.vip} tickets`);
			console.log(`      Normal: ${data.normal} tickets`);
			console.log(`      Total Revenue: ₹${data.totalAmount}`);
		});

		console.log(
			`\n💰 Total Revenue: ₹${tickets.reduce((sum, t) => sum + t.amount, 0)}`
		);
		console.log(
			`📊 Total Tickets: ${tickets.reduce((sum, t) => sum + t.quantity, 0)}`
		);

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding tickets:", error);
		process.exit(1);
	}
};

seedTickets();
