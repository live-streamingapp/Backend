import express from "express";
import axios from "axios";

const kundliRoutes = express.Router();

const ASTROLOGY_API_URL =
	process.env.ASTROLOGY_API_URL || "https://json.freeastrologyapi.com";
const ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY;

// Simple in-memory cache to reduce API calls
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = "v2"; // Increment this to invalidate old cache entries

// Helper function to generate cache key
const generateCacheKey = (endpoint, data) => {
	return `${CACHE_VERSION}_${endpoint}_${JSON.stringify(data)}`;
};

// Helper function to get from cache
const getFromCache = (key) => {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		console.log(`Cache HIT for ${key}`);
		return cached.data;
	}
	console.log(`Cache MISS for ${key}`);
	return null;
};

// Helper function to set cache
const setCache = (key, data) => {
	cache.set(key, { data, timestamp: Date.now() });
	// Cleanup old cache entries (keep only last 100)
	if (cache.size > 100) {
		const firstKey = cache.keys().next().value;
		cache.delete(firstKey);
	}
};

// Helper function to make API calls to Free Astrology API
const makeAstrologyAPICall = async (endpoint, data) => {
	const url = `${ASTROLOGY_API_URL}${endpoint}`;

	// Check cache first
	const cacheKey = generateCacheKey(endpoint, data);
	const cachedData = getFromCache(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	console.log(`Making API call to: ${url}`);
	console.log(`Request data:`, JSON.stringify(data, null, 2));

	try {
		const response = await axios.post(url, data, {
			headers: {
				"Content-Type": "application/json",
				"x-api-key": ASTROLOGY_API_KEY,
			},
			timeout: 10000, // 10 second timeout
			maxRedirects: 0, // No redirects
			validateStatus: (status) => status === 200, // Only accept 200 as success
		});

		console.log(`Success response from ${endpoint}:`, response.status);

		// Cache the response
		setCache(cacheKey, response.data);

		return response.data;
	} catch (error) {
		console.error(
			`Failed to call ${endpoint}:`,
			error.response?.data || error.message
		);
		console.error(`Response status:`, error.response?.status);

		// Don't retry on authentication errors (403) or rate limits (429)
		if (error.response?.status === 403) {
			throw new Error("Authentication failed - check API key");
		}
		if (error.response?.status === 429) {
			throw new Error("Rate limit exceeded - please try again later");
		}

		throw new Error(
			error.response?.data?.message || error.message || "API call failed"
		);
	}
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/kundli/generate - Generate complete Kundli
kundliRoutes.post("/generate", async (req, res) => {
	try {
		const { day, month, year, hour, min, lat, lon, tzone } = req.body;

		// Validate required fields
		if (
			!day ||
			!month ||
			!year ||
			!hour ||
			min === undefined ||
			!lat ||
			!lon ||
			!tzone
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: day, month, year, hour, min, lat, lon, tzone",
			});
		}

		// Prepare request body using exact API field names with config
		const requestBody = {
			year: parseInt(year),
			month: parseInt(month),
			date: parseInt(day), // API uses 'date' not 'day'
			hours: parseInt(hour), // API uses 'hours' not 'hour'
			minutes: parseInt(min), // API uses 'minutes' not 'minute'
			seconds: 0, // API requires seconds (default to 0)
			latitude: parseFloat(lat),
			longitude: parseFloat(lon),
			timezone: parseFloat(tzone),
			config: {
				observation_point: "topocentric",
				ayanamsha: "lahiri",
			},
		};

		console.log("Generating Kundli with data:", requestBody);

		// Make API calls SEQUENTIALLY with delays to respect rate limit (1 req/second)
		// Stop immediately if any call fails (no automatic retry)
		let planetsData, chartSVG, nakshatraData, dashaData;

		try {
			planetsData = await makeAstrologyAPICall(
				"/planets/extended",
				requestBody
			);
			console.log("✓ Planets data fetched successfully");
		} catch (error) {
			console.error("✗ Failed to fetch planets data");
			throw error; // Stop here, don't continue
		}

		await delay(1100); // Wait 1.1 seconds

		try {
			chartSVG = await makeAstrologyAPICall(
				"/horoscope-chart-svg-code",
				requestBody
			);
			console.log("✓ Lagna Chart (Rasi) SVG fetched successfully");
		} catch (error) {
			console.error("✗ Failed to fetch lagna chart SVG");
			throw error; // Stop here, don't continue
		}

		await delay(1100); // Wait 1.1 seconds

		// Fetch Navamsa chart (D9) - important divisional chart
		let navamsaChartSVG;
		try {
			navamsaChartSVG = await makeAstrologyAPICall(
				"/navamsa-chart-svg-code",
				requestBody
			);
			console.log("✓ Navamsa Chart (D9) SVG fetched successfully");
		} catch (error) {
			console.error("✗ Failed to fetch navamsa chart SVG");
			throw error; // Stop here, don't continue
		}

		await delay(1100); // Wait 1.1 seconds

		try {
			nakshatraData = await makeAstrologyAPICall(
				"/nakshatra-durations",
				requestBody
			);
			console.log("✓ Nakshatra data fetched successfully");
		} catch (error) {
			console.error("✗ Failed to fetch nakshatra data");
			throw error; // Stop here, don't continue
		}

		await delay(1100); // Wait 1.1 seconds

		try {
			dashaData = await makeAstrologyAPICall(
				"/vimsottari/maha-dasas",
				requestBody
			);
			console.log("✓ Dasha data fetched successfully");
		} catch (error) {
			console.error("✗ Failed to fetch dasha data");
			throw error; // Stop here, don't continue
		}

		return res.status(200).json({
			success: true,
			data: {
				planets: planetsData,
				lagnaChart: chartSVG, // Lagna/Rasi chart (D1)
				navamsaChart: navamsaChartSVG, // Navamsa chart (D9)
				nakshatra: nakshatraData,
				dasha: dashaData,
			},
		});
	} catch (error) {
		console.error("Error generating Kundli:", error.message);

		// Check for specific error types
		if (error.message?.includes("Authentication failed")) {
			return res.status(403).json({
				success: false,
				message: "API authentication failed. Please check configuration.",
			});
		}

		if (
			error.message?.includes("Rate limit exceeded") ||
			error.message?.includes("Too Many Requests")
		) {
			return res.status(429).json({
				success: false,
				message: "Rate limit exceeded. Please wait a moment and try again.",
			});
		}

		return res.status(500).json({
			success: false,
			message: error.message || "Failed to generate Kundli",
		});
	}
});

// POST /api/kundli/planets - Get planetary positions only
kundliRoutes.post("/planets", async (req, res) => {
	try {
		const requestBody = req.body;
		const data = await makeAstrologyAPICall("/planets/extended", requestBody);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		console.error("Error fetching planets:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch planetary positions",
		});
	}
});

// POST /api/kundli/chart - Get birth chart SVG only
kundliRoutes.post("/chart", async (req, res) => {
	try {
		const requestBody = req.body;
		const data = await makeAstrologyAPICall(
			"/horoscope-chart-svg-code",
			requestBody
		);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		console.error("Error fetching chart:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch birth chart",
		});
	}
});

// POST /api/kundli/nakshatra - Get nakshatra details only
kundliRoutes.post("/nakshatra", async (req, res) => {
	try {
		const requestBody = req.body;
		const data = await makeAstrologyAPICall(
			"/nakshatra-durations",
			requestBody
		);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		console.error("Error fetching nakshatra:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch nakshatra details",
		});
	}
});

// POST /api/kundli/dasha - Get dasha details only
kundliRoutes.post("/dasha", async (req, res) => {
	try {
		const requestBody = req.body;
		const data = await makeAstrologyAPICall(
			"/vimsottari/maha-dasas",
			requestBody
		);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		console.error("Error fetching dasha:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch dasha details",
		});
	}
});

// GET /api/kundli/clear-cache - Clear the cache (useful for development)
kundliRoutes.get("/clear-cache", (req, res) => {
	const cacheSize = cache.size;
	cache.clear();
	console.log(`Cleared ${cacheSize} cache entries`);
	return res.status(200).json({
		success: true,
		message: `Cache cleared successfully. Removed ${cacheSize} entries.`,
	});
});

export default kundliRoutes;
