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

const parseNumber = (value, fallback) => {
	if (value === undefined || value === null || value === "") return fallback;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? fallback : parsed;
};

const parseArrayOfStrings = (value, fallback = []) => {
	if (Array.isArray(value)) {
		return value
			.map((item) => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean);
	}
	if (typeof value === "string" && value.trim()) {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return fallback;
};

export const normaliseEventPayload = (rawPayload = {}, defaults = {}) => {
	const base = {
		registrationRequired: true,
		isVirtual: false,
		entryAmount: 0,
		topics: [],
		resources: [],
		requirements: [],
		virtualPlatform: {},
		organizer: {},
		createdBy: null,
		thumbnail: undefined,
		thumbnailPublicId: undefined,
		...defaults,
	};

	const virtualPlatformPayload = rawPayload.virtualPlatform ?? {};

	return {
		title: rawPayload.title ?? base.title,
		description: rawPayload.description ?? base.description,
		startTime: rawPayload.startTime
			? new Date(rawPayload.startTime)
			: base.startTime,
		endTime: rawPayload.endTime ? new Date(rawPayload.endTime) : base.endTime,
		entryAmount: parseNumber(rawPayload.entryAmount, base.entryAmount ?? 0),
		capacity: parseNumber(rawPayload.capacity, base.capacity),
		registrationRequired:
			rawPayload.registrationRequired !== undefined
				? parseBoolean(
						rawPayload.registrationRequired,
						base.registrationRequired
				  )
				: base.registrationRequired,
		location: rawPayload.location ?? base.location,
		isVirtual:
			rawPayload.isVirtual !== undefined
				? parseBoolean(rawPayload.isVirtual, base.isVirtual)
				: base.isVirtual,
		virtualPlatform: {
			...base.virtualPlatform,
			...virtualPlatformPayload,
			liveStreaming:
				virtualPlatformPayload.liveStreaming !== undefined
					? parseBoolean(
							virtualPlatformPayload.liveStreaming,
							base.virtualPlatform?.liveStreaming ?? false
					  )
					: base.virtualPlatform?.liveStreaming,
		},
		organizer: {
			...base.organizer,
			...(rawPayload.organizer ?? {}),
		},
		topics:
			rawPayload.topics !== undefined
				? parseArrayOfStrings(rawPayload.topics, base.topics)
				: base.topics,
		resources:
			rawPayload.resources !== undefined
				? parseArrayOfStrings(rawPayload.resources, base.resources)
				: base.resources,
		requirements:
			rawPayload.requirements !== undefined
				? parseArrayOfStrings(rawPayload.requirements, base.requirements)
				: base.requirements,
		createdBy: rawPayload.createdBy ?? base.createdBy,
		thumbnail: rawPayload.thumbnail ?? base.thumbnail,
		thumbnailPublicId: rawPayload.thumbnailPublicId ?? base.thumbnailPublicId,
	};
};
