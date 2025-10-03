import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },

		// Event timing
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },

		// Ticketing / Entry
		entryAmount: { type: Number, default: 0 },
		capacity: { type: Number }, // max participants
		registrationRequired: { type: Boolean, default: true },

		// Location / Venue
		location: { type: String }, // for physical
		isVirtual: { type: Boolean, default: false },
		virtualPlatform: {
			name: { type: String },
			url: { type: String },
			liveStreaming: { type: Boolean, default: false },
			streamingUrl: { type: String },
		},

		// Topics / Tags
		topics: [{ type: String }],
		resources: [{ type: String }],
		requirements: [{ type: String }],

		// Organizer
		organizer: {
			name: { type: String },
			email: { type: String },
			contact: { type: String },
		},
		thumbnail: { type: String },
		thumbnailPublicId: { type: String },

		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
