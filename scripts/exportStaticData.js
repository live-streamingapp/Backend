import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Service from "../model/ServiceModel.js";
import Podcast from "../model/PodcastModel.js";
import Course from "../model/CourseModel.js";
import CourseSession from "../model/CourseSessionModel.js";
import Blog from "../model/BlogModel.js";
import Book from "../model/BookModel.js";
import Banner from "../model/BannerModel.js";
import Event from "../model/EventModel.js";
import Testimonial from "../model/TestimonialModel.js";
import About from "../model/AboutUsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Helper: drop fields safely
const omitKeys = (obj, keys = []) => {
	if (!obj) return obj;
	const out = { ...obj };
	for (const k of keys) delete out[k];
	return out;
};

// Strip internal fields and relational refs we don't want to carry across DBs
const scrubDoc = (doc) => {
	const json = JSON.parse(JSON.stringify(doc));
	// common mongoose fields
	delete json._id;
	delete json.__v;
	// timestamps are okay to keep for static content; retain createdAt/updatedAt
	return json;
};

async function main() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error("MONGO_URI not set");
		process.exit(1);
	}
	await mongoose.connect(uri);
	console.log("Connected to MongoDB for export...");

	// Fetch static collections only; DO NOT export users, orders, progress, notifications
	const [
		services,
		podcasts,
		courses,
		sessions,
		blogs,
		books,
		banners,
		events,
		testimonials,
		aboutUs,
	] = await Promise.all([
		Service.find({}).lean(),
		Podcast.find({}).lean(),
		Course.find({}).lean(),
		CourseSession.find({}).lean(),
		Blog.find({}).lean(),
		Book.find({}).lean(),
		Banner.find({}).lean(),
		Event.find({}).lean(),
		Testimonial.find({}).lean(),
		About.find({}).lean(),
	]);

	// Prepare sanitized payloads
	const data = {
		metadata: {
			generatedAt: new Date().toISOString(),
			note: "Static export: no users, no orders, no progress.",
		},
		services: services.map(scrubDoc),
		consultations: services
			.filter((s) => s.serviceType === "consultation")
			.map(scrubDoc),
		packages: services.filter((s) => s.serviceType === "package").map(scrubDoc),
		podcasts: podcasts.map(scrubDoc),
		courses: courses.map((c) =>
			scrubDoc(omitKeys(c, ["createdBy", "progress"]))
		),
		courseSessions: sessions.map((s) => {
			const base = scrubDoc(
				omitKeys(s, [
					"enrolledStudents",
					"attendedStudents",
					"chatMessages",
					"questionsAsked",
				])
			);
			if (base.agora) {
				// remove any transient or secret fields
				delete base.agora.token;
				delete base.agora.tokenExpiry;
				// appId can be considered sensitive too; drop it if present
				delete base.agora.appId;
			}
			return base;
		}),
		blogs: blogs.map(scrubDoc),
		books: books.map((b) => scrubDoc(omitKeys(b, ["createdBy"]))),
		banners: banners.map(scrubDoc),
		events: events.map((e) => scrubDoc(omitKeys(e, ["createdBy"]))),
		testimonials: testimonials.map(scrubDoc),
		aboutUs: aboutUs.map(scrubDoc),
	};

	// Write JSON to stdout so users can redirect to file
	process.stdout.write(JSON.stringify(data, null, 2));
	await mongoose.connection.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
