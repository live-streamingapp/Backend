import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

const runScript = async (scriptName, description) => {
	console.log(`\n${"=".repeat(60)}`);
	console.log(`🚀 ${description}`);
	console.log(`${"=".repeat(60)}\n`);

	try {
		const { stdout, stderr } = await execPromise(`node ${scriptName}`);
		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);
	} catch (error) {
		console.error(`❌ Error running ${scriptName}:`, error.message);
		throw error;
	}
};

const seedAll = async () => {
	const startTime = Date.now();

	console.log("\n");
	console.log("╔════════════════════════════════════════════════════════════╗");
	console.log("║                                                            ║");
	console.log("║           🌟 COMPLETE DATABASE SEEDING 🌟                 ║");
	console.log("║                                                            ║");
	console.log("╚════════════════════════════════════════════════════════════╝");

	try {
		// Run all seed scripts in sequence
		await runScript("scripts/seedAdminData.js", "Step 1: Seeding Admin Users");
		await runScript("scripts/seedProducts.js", "Step 2: Seeding Products");
		await runScript(
			"scripts/seedServices.js",
			"Step 3: Seeding Services (Consultations & Packages)"
		);
		await runScript(
			"scripts/seedCustomersAndOrders.js",
			"Step 4: Seeding Customers & Orders"
		);
		await runScript(
			"scripts/seedStudentReports.js",
			"Step 5: Seeding Student Reports"
		);
		await runScript(
			"scripts/seedConsultationData.js",
			"Step 6: Seeding Consultation Data"
		);
		await runScript("scripts/seedTickets.js", "Step 7: Seeding Event Tickets");

		const endTime = Date.now();
		const duration = ((endTime - startTime) / 1000).toFixed(2);

		console.log("\n");
		console.log(
			"╔════════════════════════════════════════════════════════════╗"
		);
		console.log(
			"║                                                            ║"
		);
		console.log(
			"║              ✅ ALL SEEDING COMPLETED! ✅                  ║"
		);
		console.log(
			"║                                                            ║"
		);
		console.log(
			`║              Completed in ${duration} seconds                    ║`
		);
		console.log(
			"║                                                            ║"
		);
		console.log(
			"╚════════════════════════════════════════════════════════════╝"
		);

		console.log("\n📋 Quick Reference:");
		console.log("   • Admin Email: admin@astro.com");
		console.log("   • Customer Email: rajesh.kumar@example.com");
		console.log("   • Password (all): password123");
		console.log("\n   • Products seeded: 8 items");
		console.log(
			"   • Services seeded: 12 items (4 consultations + 8 packages)"
		);
		console.log("   • Customers created: 10 users");
		console.log("   • Orders generated: 20-40 orders");
		console.log("   • Reports created: 20-40 reports");
		console.log("   • Event Tickets: 20 tickets across 13 events");
		console.log("\n");

		process.exit(0);
	} catch (error) {
		console.error("\n❌ Seeding process failed:", error.message);
		process.exit(1);
	}
};

seedAll();
