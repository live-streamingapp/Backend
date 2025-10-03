const ensureArrayOfStrings = (value) => {
	if (Array.isArray(value)) {
		return value
			.map((item) => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean);
	}
	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
};

const parseBoolean = (value, defaultValue = false) => {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		return ["true", "1", "yes", "on"].includes(value.toLowerCase());
	}
	if (typeof value === "number") {
		return value === 1;
	}
	return defaultValue;
};

const parseNumber = (value) => {
	if (value === undefined || value === null || value === "") return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
};

export const normaliseCoursePayload = (rawPayload = {}) => {
	const payload = { ...rawPayload };

	payload.languages = ensureArrayOfStrings(payload.languages);
	payload.subtitles = ensureArrayOfStrings(payload.subtitles);
	payload.whatYouWillLearn = ensureArrayOfStrings(payload.whatYouWillLearn);
	payload.relatedTopics = ensureArrayOfStrings(payload.relatedTopics);
	payload.courseIncludes = ensureArrayOfStrings(payload.courseIncludes);
	payload.detailedDescription = ensureArrayOfStrings(
		payload.detailedDescription
	);
	payload.requirements = ensureArrayOfStrings(payload.requirements);

	payload.includedInPlans = parseBoolean(payload.includedInPlans);
	payload.premium = parseBoolean(payload.premium);

	payload.price = parseNumber(payload.price);
	payload.originalPrice = parseNumber(payload.originalPrice);
	payload.duration = parseNumber(payload.duration);
	payload.lessons = parseNumber(payload.lessons);
	payload.progress = parseNumber(payload.progress);

	if (Array.isArray(payload.courseContent)) {
		payload.courseContent = payload.courseContent.map((lesson = {}) => ({
			title: lesson.title ?? "",
			preview: parseBoolean(lesson.preview),
			video: lesson.video ?? "",
		}));
	} else {
		payload.courseContent = [];
	}

	return payload;
};
