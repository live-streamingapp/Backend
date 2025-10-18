import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

function readStdin() {
	return new Promise((resolve, reject) => {
		let data = "";
		process.stdin.setEncoding("utf8");
		process.stdin.on("data", (chunk) => (data += chunk));
		process.stdin.on("end", () => resolve(data));
		process.stdin.on("error", reject);
	});
}

async function main() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error("MONGO_URI not set");
		process.exit(1);
	}
	await mongoose.connect(uri);
	console.log("Connected to MongoDB for import...");

	let input = "";
	if (!process.stdin.isTTY) {
		input = await readStdin();
	} else {
		// Allow providing a file path argument: node importStaticData.js data.json
		const fileArg = process.argv[2];
		if (!fileArg) {
			console.error("Provide JSON via stdin or as a file argument.");
			process.exit(1);
		}
		input = fs.readFileSync(path.resolve(process.cwd(), fileArg), "utf8");
	}

	const payload = JSON.parse(input);

	// Ensure required createdBy for models that require it (Course, Book, Event)
	const createdByHex = (
		process.env.IMPORT_CREATED_BY || "000000000000000000000000"
	).trim();
	let createdByFallback;
	try {
		createdByFallback = new mongoose.Types.ObjectId(createdByHex);
	} catch (e) {
		createdByFallback = new mongoose.Types.ObjectId("000000000000000000000000");
	}
	const withCreatedBy = (arr = []) =>
		Array.isArray(arr)
			? arr.map((d) => ({ ...d, createdBy: d.createdBy ?? createdByFallback }))
			: [];

	// optional: clear existing docs in target DB for these collections
	const truncate = process.env.TRUNCATE_STATIC === "true";
	if (truncate) {
		await Promise.all([
			Service.deleteMany({}),
			Podcast.deleteMany({}),
			Course.deleteMany({}),
			CourseSession.deleteMany({}),
			Blog.deleteMany({}),
			Book.deleteMany({}),
			Banner.deleteMany({}),
			Event.deleteMany({}),
			Testimonial.deleteMany({}),
			About.deleteMany({}),
		]);
		console.log("Cleared existing static collections (TRUNCATE_STATIC=true).");
	}

	const insert = async (Model, arr = [], label) => {
		if (!Array.isArray(arr) || arr.length === 0) return 0;
		try {
			const res = await Model.insertMany(arr, { ordered: false });
			console.log(`Inserted ${res.length} ${label}`);
			return res.length;
		} catch (e) {
			// Gracefully handle duplicate key errors (e.g., unique indexes)
			if (e && (e.code === 11000 || e.name === "MongoBulkWriteError")) {
				const insertedCount =
					e.result?.result?.nInserted ?? e.insertedDocs?.length ?? 0;
				console.warn(
					`Inserted ${insertedCount} ${label} (some duplicates skipped)`
				);
				return insertedCount;
			}
			throw e;
		}
	};

	await insert(Service, payload.services ?? [], "services");
	await insert(Podcast, payload.podcasts ?? [], "podcasts");
	await insert(Course, withCreatedBy(payload.courses ?? []), "courses");
	// Ensure course session agora.channelName uniqueness to avoid E11000
	const uniqueSessions = (payload.courseSessions ?? []).map((s, idx) => {
		const doc = { ...s };
		doc.agora = doc.agora || {};
		const base = (doc.agora.channelName || "session")
			.replace(/[^a-zA-Z0-9_-]/g, "")
			.slice(0, 40);
		const suffix = `${Date.now().toString().slice(-6)}_${idx}`;
		doc.agora.channelName = `${base}_${suffix}`;
		// Drop any leftover transient fields just in case
		delete doc.agora.token;
		delete doc.agora.tokenExpiry;
		delete doc.agora.appId;
		return doc;
	});
	await insert(CourseSession, uniqueSessions, "course sessions");
	await insert(Blog, payload.blogs ?? [], "blogs");
	await insert(Book, withCreatedBy(payload.books ?? []), "books");
	await insert(Banner, payload.banners ?? [], "banners");
	await insert(Event, withCreatedBy(payload.events ?? []), "events");
	await insert(Testimonial, payload.testimonials ?? [], "testimonials");
	await insert(About, payload.aboutUs ?? [], "about-us");

	await mongoose.connection.close();
	console.log("Static data import completed.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
