import Notification from "../../model/NotificationModel.js";
import User from "../../model/UserModel.js";
import CourseSession from "../../model/CourseSessionModel.js";

/**
 * Create notifications for session-related events
 */

// Helper function to get enrolled students for a course
const getEnrolledStudents = async (courseId) => {
	try {
		const enrolledUsers = await User.find(
			{ enrolledCourses: courseId },
			"_id"
		).lean();
		return enrolledUsers.map((user) => user._id);
	} catch (error) {
		console.error("Error fetching enrolled students:", error);
		return [];
	}
};

// Create notification for new session
export const notifySessionCreated = async (sessionData) => {
	try {
		const { course, title, scheduledDate, scheduledTime } = sessionData;

		if (!course) {
			console.warn("No course ID provided for session notification");
			return { success: false, message: "Course ID required" };
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "New Live Session Scheduled",
			message: `A new session "${title}" has been scheduled for ${new Date(
				scheduledDate
			).toLocaleDateString()} at ${scheduledTime}. Don't miss it!`,
			path: `/course/${course}/sessions`,
			type: "course",
			priority: "medium",
			metadata: {
				sessionId: sessionData._id,
				courseId: course,
				sessionTitle: title,
				sessionDate: scheduledDate,
				sessionTime: scheduledTime,
				eventType: "session_created",
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Session creation notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating session notifications:", error);
		return { success: false, message: error.message };
	}
};

// Create notification for session updates
export const notifySessionUpdated = async (sessionData, changes = {}) => {
	try {
		const { course, title, scheduledDate, scheduledTime } = sessionData;

		if (!course) {
			console.warn("No course ID provided for session update notification");
			return { success: false, message: "Course ID required" };
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		// Create more specific message based on what changed
		let message = `Session "${title}" has been updated.`;
		if (changes.scheduledDate || changes.scheduledTime) {
			message = `Session "${title}" has been rescheduled to ${new Date(
				scheduledDate
			).toLocaleDateString()} at ${scheduledTime}.`;
		} else if (changes.title) {
			message = `Session has been renamed to "${title}".`;
		} else if (changes.description) {
			message = `Session "${title}" details have been updated. Check the latest information.`;
		}

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "Session Updated",
			message,
			path: `/course/${course}/sessions`,
			type: "course",
			priority:
				changes.scheduledDate || changes.scheduledTime ? "high" : "medium",
			metadata: {
				sessionId: sessionData._id,
				courseId: course,
				sessionTitle: title,
				sessionDate: scheduledDate,
				sessionTime: scheduledTime,
				eventType: "session_updated",
				changes,
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Session update notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating session update notifications:", error);
		return { success: false, message: error.message };
	}
};

// Create notification when session starts
export const notifySessionStarted = async (sessionData) => {
	try {
		const { course, title, _id } = sessionData;

		if (!course) {
			console.warn("No course ID provided for session start notification");
			return { success: false, message: "Course ID required" };
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "Live Session Started",
			message: `Your session "${title}" is now live! Join now to participate.`,
			path: `/session/${_id}`,
			type: "course",
			priority: "high",
			metadata: {
				sessionId: _id,
				courseId: course,
				sessionTitle: title,
				eventType: "session_started",
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Session start notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating session start notifications:", error);
		return { success: false, message: error.message };
	}
};

// Create notification when session ends with recording
export const notifySessionRecordingAvailable = async (sessionData) => {
	try {
		const { course, title, _id, recording } = sessionData;

		if (!course) {
			console.warn("No course ID provided for session recording notification");
			return { success: false, message: "Course ID required" };
		}

		// Only send notification if recording actually exists
		if (!recording || !recording.recordingUrl) {
			console.log("No recording URL available, skipping notification");
			return {
				success: true,
				message: "No recording available, notification skipped",
			};
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "Session Recording Available",
			message: `The recording for "${title}" is now available. You can watch it anytime from your course dashboard.`,
			path: `/course/${course}/sessions`,
			type: "course",
			priority: "medium",
			metadata: {
				sessionId: _id,
				courseId: course,
				sessionTitle: title,
				eventType: "recording_available",
				recordingUrl: recording.recordingUrl,
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Recording notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating recording notifications:", error);
		return { success: false, message: error.message };
	}
};

// Create notification for session cancellation
export const notifySessionCancelled = async (sessionData, reason = "") => {
	try {
		const { course, title, scheduledDate, scheduledTime } = sessionData;

		if (!course) {
			console.warn(
				"No course ID provided for session cancellation notification"
			);
			return { success: false, message: "Course ID required" };
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		const message = reason
			? `Session "${title}" scheduled for ${new Date(
					scheduledDate
			  ).toLocaleDateString()} at ${scheduledTime} has been cancelled. Reason: ${reason}`
			: `Session "${title}" scheduled for ${new Date(
					scheduledDate
			  ).toLocaleDateString()} at ${scheduledTime} has been cancelled.`;

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "Session Cancelled",
			message,
			path: `/course/${course}/sessions`,
			type: "warning",
			priority: "high",
			metadata: {
				sessionId: sessionData._id,
				courseId: course,
				sessionTitle: title,
				sessionDate: scheduledDate,
				sessionTime: scheduledTime,
				eventType: "session_cancelled",
				reason,
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Session cancellation notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating session cancellation notifications:", error);
		return { success: false, message: error.message };
	}
};

// Create notification for session reminder (24 hours before)
export const notifySessionReminder = async (sessionData) => {
	try {
		const { course, title, scheduledDate, scheduledTime } = sessionData;

		if (!course) {
			console.warn("No course ID provided for session reminder notification");
			return { success: false, message: "Course ID required" };
		}

		const enrolledStudents = await getEnrolledStudents(course);

		if (enrolledStudents.length === 0) {
			return { success: true, message: "No enrolled students found" };
		}

		const notifications = enrolledStudents.map((userId) => ({
			userId,
			title: "Session Reminder",
			message: `Reminder: Your session "${title}" is scheduled for tomorrow at ${scheduledTime}. Make sure you're ready to join!`,
			path: `/course/${course}/sessions`,
			type: "info",
			priority: "medium",
			metadata: {
				sessionId: sessionData._id,
				courseId: course,
				sessionTitle: title,
				sessionDate: scheduledDate,
				sessionTime: scheduledTime,
				eventType: "session_reminder",
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `Session reminder notifications sent to ${createdNotifications.length} students`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating session reminder notifications:", error);
		return { success: false, message: error.message };
	}
};

export default {
	notifySessionCreated,
	notifySessionUpdated,
	notifySessionStarted,
	notifySessionRecordingAvailable,
	notifySessionCancelled,
	notifySessionReminder,
};
