import CourseSession from "../../model/CourseSessionModel.js";
import Course from "../../model/CourseModel.js";
import Instructor from "../../model/InstructorModel.js";
import Order from "../../model/OrderModel.js";
import StudentProgress from "../../model/StudentProgressModel.js";
import { generateRtcToken, isTokenExpired } from "../../utils/agoraToken.js";
import {
	notifySessionCreated,
	notifySessionUpdated,
	notifySessionStarted,
	notifySessionRecordingAvailable,
	notifySessionCancelled,
} from "../Notification/SessionNotifications.js";

// Create a new course session (Admin only)
export const createSession = async (req, res) => {
	try {
		const {
			courseId,
			instructorId,
			title,
			description,
			sessionNumber,
			scheduledDate,
			scheduledTime,
			duration,
			materials = [],
			chatEnabled = true,
		} = req.body;

		// Validate course exists
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}

		// Validate instructor exists
		const instructor = await Instructor.findById(instructorId);
		if (!instructor) {
			return res.status(404).json({
				success: false,
				message: "Instructor not found",
			});
		}

		// Get enrolled students for this course
		const enrolledOrders = await Order.find({
			"items.itemId": courseId,
			"items.itemType": "course",
			paymentStatus: "paid",
		}).select("user");

		const enrolledStudents = [
			...new Set(enrolledOrders.map((order) => order.user)),
		];

		// Create session
		const session = new CourseSession({
			course: courseId,
			instructor: instructorId,
			title,
			description,
			sessionNumber,
			scheduledDate: new Date(scheduledDate),
			scheduledTime,
			duration,
			enrolledStudents,
			materials,
			chatEnabled,
			createdBy: req.user._id,
			agora: {
				appId: process.env.AGORA_APP_ID, // Set in environment variables
			},
		});

		await session.save();

		// Update total sessions count for all enrolled students' progress
		await StudentProgress.updateMany(
			{
				course: courseId,
				student: { $in: enrolledStudents },
			},
			{
				$inc: { "sessionProgress.totalSessions": 1 },
			}
		);

		const populatedSession = await CourseSession.findById(session._id)
			.populate("course", "title")
			.populate("instructor", "name email avatar");

		// Send notifications to enrolled students
		try {
			await notifySessionCreated(populatedSession);
		} catch (notificationError) {
			console.error(
				"Error sending session creation notifications:",
				notificationError
			);
			// Don't fail the request if notifications fail
		}

		res.status(201).json({
			success: true,
			message: "Session created successfully",
			data: populatedSession,
		});
	} catch (error) {
		console.error("Error creating session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create session",
			error: error.message,
		});
	}
};

// Update session details (Admin only)
export const updateSession = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const updates = req.body;

		const session = await CourseSession.findById(sessionId);
		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Don't allow updates to live or completed sessions
		if (session.status === "live") {
			return res.status(400).json({
				success: false,
				message: "Cannot update live session",
			});
		}

		// Track changes for notifications
		const changes = {};
		const originalData = {
			title: session.title,
			description: session.description,
			scheduledDate: session.scheduledDate,
			scheduledTime: session.scheduledTime,
			duration: session.duration,
		};

		// Update allowed fields
		const allowedUpdates = [
			"title",
			"description",
			"scheduledDate",
			"scheduledTime",
			"duration",
			"materials",
			"chatEnabled",
			"sessionNotes",
		];

		allowedUpdates.forEach((field) => {
			if (updates[field] !== undefined) {
				const oldValue = session[field];
				let newValue = updates[field];

				if (field === "scheduledDate") {
					newValue = new Date(updates[field]);
				}

				// Track changes for important fields
				if (
					[
						"title",
						"description",
						"scheduledDate",
						"scheduledTime",
						"duration",
					].includes(field)
				) {
					if (field === "scheduledDate") {
						if (oldValue.getTime() !== newValue.getTime()) {
							changes[field] = { old: oldValue, new: newValue };
						}
					} else if (oldValue !== newValue) {
						changes[field] = { old: oldValue, new: newValue };
					}
				}

				session[field] = newValue;
			}
		});

		session.lastModifiedBy = req.user._id;
		await session.save();

		const populatedSession = await CourseSession.findById(session._id)
			.populate("course", "title")
			.populate("instructor", "name email avatar");

		// Send notifications if there were significant changes
		if (Object.keys(changes).length > 0) {
			try {
				await notifySessionUpdated(populatedSession, changes);
			} catch (notificationError) {
				console.error(
					"Error sending session update notifications:",
					notificationError
				);
				// Don't fail the request if notifications fail
			}
		}

		res.status(200).json({
			success: true,
			message: "Session updated successfully",
			data: populatedSession,
		});
	} catch (error) {
		console.error("Error updating session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update session",
			error: error.message,
		});
	}
};

// Start a live session (Admin/Instructor)
export const startSession = async (req, res) => {
	try {
		const { sessionId } = req.params;

		const session = await CourseSession.findById(sessionId)
			.populate("course", "title")
			.populate("instructor", "name email avatar");

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		if (session.status !== "scheduled") {
			return res.status(400).json({
				success: false,
				message: "Session is not in scheduled status",
			});
		}

		// Ensure appId is present
		if (!session.agora.appId) {
			session.agora.appId = process.env.AGORA_APP_ID;
		}

		// Generate Agora token using server credentials (if certificate configured)
		try {
			if (process.env.AGORA_APP_CERTIFICATE) {
				const { token, expireAt } = generateRtcToken({
					appId: process.env.AGORA_APP_ID,
					appCertificate: process.env.AGORA_APP_CERTIFICATE,
					channelName: session.agora.channelName,
					uid: 0, // allow any uid; client may join with null/auto
					role: "publisher", // host starts session with publish privileges
				});
				session.agora.token = token;
				session.agora.tokenExpiry = expireAt;
			} else {
				console.warn(
					"AGORA_APP_CERTIFICATE not set. Skipping token generation. Ensure project is in testing mode or enable app certificate to use tokens."
				);
				session.agora.token = null;
				session.agora.tokenExpiry = null;
			}
		} catch (e) {
			console.error("Failed to generate Agora token:", e);
			// Don't block starting the session; client may attempt to join without token in testing
			session.agora.token = null;
			session.agora.tokenExpiry = null;
		}

		await session.startSession();

		// Send notifications to enrolled students that session has started
		try {
			await notifySessionStarted(session);
		} catch (notificationError) {
			console.error(
				"Error sending session start notifications:",
				notificationError
			);
			// Don't fail the request if notifications fail
		}

		res.status(200).json({
			success: true,
			message: "Session started successfully",
			data: {
				sessionId: session._id,
				channelName: session.agora.channelName,
				appId: session.agora.appId,
				token: session.agora.token,
				status: session.status,
			},
		});
	} catch (error) {
		console.error("Error starting session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to start session",
			error: error.message,
		});
	}
};

// End a live session (Admin/Instructor)
export const endSession = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const {
			sessionSummary,
			keyTopicsCovered = [],
			homeworkAssigned,
		} = req.body;

		const session = await CourseSession.findById(sessionId);
		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		if (session.status !== "live") {
			return res.status(400).json({
				success: false,
				message: "Session is not currently live",
			});
		}

		// Update session details
		session.sessionSummary = sessionSummary;
		session.keyTopicsCovered = keyTopicsCovered;
		session.homeworkAssigned = homeworkAssigned;

		await session.endSession();

		// Update student progress for all attendees
		const attendedStudentIds = session.attendedStudents.map(
			(att) => att.student
		);
		await Promise.all(
			attendedStudentIds.map(async (studentId) => {
				const attendance = session.attendedStudents.find(
					(att) => att.student.toString() === studentId.toString()
				);

				const progress = await StudentProgress.findOne({
					student: studentId,
					course: session.course,
				});

				if (progress && attendance) {
					await progress.updateSessionAttendance(
						sessionId,
						true,
						attendance.durationAttended,
						attendance.participationScore
					);
				}
			})
		);

		res.status(200).json({
			success: true,
			message: "Session ended successfully",
			data: {
				sessionId: session._id,
				status: session.status,
				actualDuration: session.actualDuration,
				attendanceCount: session.attendedStudents.length,
				attendancePercentage: session.getAttendancePercentage(),
			},
		});
	} catch (error) {
		console.error("Error ending session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to end session",
			error: error.message,
		});
	}
};

// Get session attendance report (Admin)
export const getSessionAttendance = async (req, res) => {
	try {
		const { sessionId } = req.params;

		const session = await CourseSession.findById(sessionId)
			.populate("course", "title")
			.populate("enrolledStudents", "name email avatar")
			.populate("attendedStudents.student", "name email avatar");

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Create attendance report
		const attendanceReport = session.enrolledStudents.map((student) => {
			const attendance = session.attendedStudents.find(
				(att) => att.student._id.toString() === student._id.toString()
			);

			return {
				student: {
					_id: student._id,
					name: student.name,
					email: student.email,
					avatar: student.avatar,
				},
				attended: !!attendance,
				joinedAt: attendance?.joinedAt || null,
				leftAt: attendance?.leftAt || null,
				durationAttended: attendance?.durationAttended || 0,
				participationScore: attendance?.participationScore || 0,
			};
		});

		res.status(200).json({
			success: true,
			message: "Session attendance fetched successfully",
			data: {
				session: {
					_id: session._id,
					title: session.title,
					course: session.course,
					scheduledDate: session.scheduledDate,
					actualDuration: session.actualDuration,
					status: session.status,
				},
				attendance: {
					totalEnrolled: session.enrolledStudents.length,
					totalAttended: session.attendedStudents.length,
					attendancePercentage: session.getAttendancePercentage(),
					attendanceDetails: attendanceReport,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching session attendance:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch session attendance",
			error: error.message,
		});
	}
};

// Upload session recording URL (Admin) - Only URL for old sessions, completely optional
export const uploadSessionRecording = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const {
			recordingUrl, // Only URL is required, no file upload
			recordingDuration,
			thumbnailUrl,
			isPublic = false,
			downloadable = false,
		} = req.body;

		const session = await CourseSession.findById(sessionId)
			.populate("course", "title")
			.populate("instructor", "name email avatar");

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Validate that recording URL is provided
		if (!recordingUrl || !recordingUrl.trim()) {
			return res.status(400).json({
				success: false,
				message: "Recording URL is required",
			});
		}

		// Validate URL format
		const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
		if (!urlPattern.test(recordingUrl)) {
			return res.status(400).json({
				success: false,
				message: "Please provide a valid URL",
			});
		}

		// Update recording details
		session.recording = {
			isRecorded: true,
			recordingUrl: recordingUrl.trim(),
			recordingDuration: recordingDuration || null, // Optional
			thumbnailUrl: thumbnailUrl || null, // Optional
			isPublic,
			downloadable,
			uploadedAt: new Date(),
			uploadedBy: req.user._id,
		};

		await session.save();

		// Send notifications to enrolled students about recording availability
		// Only if the session is completed and students should be notified
		if (session.status === "completed") {
			try {
				await notifySessionRecordingAvailable(session);
			} catch (notificationError) {
				console.error(
					"Error sending recording notification:",
					notificationError
				);
				// Don't fail the request if notifications fail
			}
		}

		res.status(200).json({
			success: true,
			message: "Session recording URL added successfully",
			data: {
				sessionId: session._id,
				recording: session.recording,
				notificationSent: session.status === "completed",
			},
		});
	} catch (error) {
		console.error("Error uploading session recording:", error);
		res.status(500).json({
			success: false,
			message: "Failed to upload session recording",
			error: error.message,
		});
	}
};

// Remove session recording URL (Admin) - Optional action
export const removeSessionRecording = async (req, res) => {
	try {
		const { sessionId } = req.params;

		const session = await CourseSession.findById(sessionId);
		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Reset recording details
		session.recording = {
			isRecorded: false,
			recordingUrl: null,
			recordingDuration: null,
			thumbnailUrl: null,
			isPublic: false,
			downloadable: false,
			uploadedAt: null,
			uploadedBy: null,
		};

		await session.save();

		res.status(200).json({
			success: true,
			message: "Session recording removed successfully",
		});
	} catch (error) {
		console.error("Error removing session recording:", error);
		res.status(500).json({
			success: false,
			message: "Failed to remove session recording",
			error: error.message,
		});
	}
};

// Get all sessions for admin dashboard
export const getAllSessions = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			status,
			courseId,
			instructorId,
			startDate,
			endDate,
		} = req.query;

		// Build filter
		const filter = { isActive: true };

		if (status) filter.status = status;
		if (courseId) filter.course = courseId;
		if (instructorId) filter.instructor = instructorId;

		if (startDate || endDate) {
			filter.scheduledDate = {};
			if (startDate) filter.scheduledDate.$gte = new Date(startDate);
			if (endDate) filter.scheduledDate.$lte = new Date(endDate);
		}

		const skip = (page - 1) * limit;

		const [sessions, totalCount] = await Promise.all([
			CourseSession.find(filter)
				.populate("course", "title image")
				.populate("instructor", "name email avatar")
				.sort({ scheduledDate: -1 })
				.skip(skip)
				.limit(parseInt(limit)),
			CourseSession.countDocuments(filter),
		]);

		const enrichedSessions = sessions.map((session) => ({
			...session.toObject(),
			statusDisplay: session.statusDisplay,
			attendancePercentage: session.getAttendancePercentage(),
		}));

		res.status(200).json({
			success: true,
			message: "All sessions fetched successfully",
			data: {
				sessions: enrichedSessions,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
					hasNext: page * limit < totalCount,
					hasPrev: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching all sessions:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch sessions",
			error: error.message,
		});
	}
};

// Delete session (Admin only)
export const deleteSession = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const { reason } = req.body || {}; // Optional cancellation reason

		const session = await CourseSession.findById(sessionId)
			.populate("course", "title")
			.populate("instructor", "name email avatar");

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Don't allow deletion of live sessions
		if (session.status === "live") {
			return res.status(400).json({
				success: false,
				message: "Cannot delete live session",
			});
		}

		// If session is scheduled, send cancellation notifications
		if (session.status === "scheduled") {
			try {
				await notifySessionCancelled(session, reason);
			} catch (notificationError) {
				console.error(
					"Error sending session cancellation notifications:",
					notificationError
				);
				// Don't fail the request if notifications fail
			}
		}

		// Soft delete
		session.isActive = false;
		await session.save();

		res.status(200).json({
			success: true,
			message: "Session deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete session",
			error: error.message,
		});
	}
};
