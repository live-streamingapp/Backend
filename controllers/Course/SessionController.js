import CourseSession from "../../model/CourseSessionModel.js";
import Course from "../../model/CourseModel.js";
import StudentProgress from "../../model/StudentProgressModel.js";
import Order from "../../model/OrderModel.js";
import { generateRtcToken } from "../../utils/agoraToken.js";

// Get a single session by ID (for both students and admins)
export const getSessionById = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		const session = await CourseSession.findById(sessionId)
			.populate("instructor", "name email avatar")
			.populate("course", "title description image");

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// For students, check if they're enrolled in the course
		if (userRole === "student") {
			let isEnrolled = false;
			const enrollment = await Order.findOne({
				user: userId,
				"items.itemId": session.course._id,
				"items.itemType": "course",
				paymentStatus: "paid",
			});
			isEnrolled = !!enrollment;

			if (!isEnrolled) {
				try {
					const { default: User } = await import("../../model/UserModel.js");
					const userDoc = await User.findById(userId).select("enrolledCourses");
					if (
						userDoc?.enrolledCourses?.some(
							(cid) => cid.toString() === session.course._id.toString()
						)
					) {
						isEnrolled = true;
					}
				} catch (e) {
					console.warn(
						"Fallback check user.enrolledCourses failed:",
						e?.message
					);
				}
			}

			if (!isEnrolled && Array.isArray(session.enrolledStudents)) {
				isEnrolled = session.enrolledStudents.some(
					(uid) => uid.toString() === userId.toString()
				);
			}

			if (!isEnrolled) {
				return res.status(403).json({
					success: false,
					message: "You are not enrolled in this course",
				});
			}

			// Add student-specific attendance info
			const attendance = session.attendedStudents.find(
				(att) => att.student.toString() === userId.toString()
			);

			const sessionData = {
				...session.toObject(),
				statusDisplay: session.statusDisplay,
				studentAttendance: attendance || null,
				hasAttended: !!attendance,
				canJoin:
					session.status === "live" ||
					(session.status === "scheduled" &&
						new Date(session.scheduledDate) <=
							new Date(Date.now() + 15 * 60 * 1000)), // 15 min before
			};

			return res.status(200).json({
				success: true,
				message: "Session fetched successfully",
				data: sessionData,
			});
		}

		// For admins, return full session data
		const sessionData = {
			...session.toObject(),
			statusDisplay: session.statusDisplay,
			attendancePercentage: session.getAttendancePercentage(),
			canStart: session.status === "scheduled",
			canEnd: session.status === "live",
		};

		res.status(200).json({
			success: true,
			message: "Session fetched successfully",
			data: sessionData,
		});
	} catch (error) {
		console.error("Error fetching session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch session",
			error: error.message,
		});
	}
};

// Get all sessions for a specific course
export const getCourseSessions = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { status, upcoming, completed } = req.query;

		// Build filter
		const filter = { course: courseId, isActive: true };

		if (status) {
			filter.status = status;
		}

		if (upcoming === "true") {
			filter.scheduledDate = { $gte: new Date() };
			filter.status = { $in: ["scheduled", "live"] };
		}

		if (completed === "true") {
			filter.status = "completed";
		}

		const sessions = await CourseSession.find(filter)
			.populate("instructor", "name email avatar")
			.populate("course", "title")
			.sort({ sessionNumber: 1, scheduledDate: 1 });

		// Add derived fields
		const enrichedSessions = sessions.map((session) => ({
			...session.toObject(),
			statusDisplay: session.statusDisplay,
			attendancePercentage: session.getAttendancePercentage(),
		}));

		res.status(200).json({
			success: true,
			message: "Course sessions fetched successfully",
			data: enrichedSessions,
		});
	} catch (error) {
		console.error("Error fetching course sessions:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch course sessions",
			error: error.message,
		});
	}
};

// Get student's enrolled sessions (for student dashboard)
export const getStudentSessions = async (req, res) => {
	try {
		const studentId = req.user._id;
		const { upcoming, completed, missed } = req.query;

		// Find all courses the student is enrolled in via orders
		const enrolledOrders = await Order.find({
			user: studentId,
			"items.itemType": "course",
			paymentStatus: "paid",
		}).select("items.itemId");

		let enrolledCourseIds = enrolledOrders.flatMap((order) =>
			order.items
				.filter((item) => item.itemType === "course")
				.map((item) => item.itemId)
		);

		// Fallback: if no paid orders found, try user's enrolledCourses list
		if (!enrolledCourseIds.length) {
			try {
				const { default: User } = await import("../../model/UserModel.js");
				const userDoc = await User.findById(studentId).select(
					"enrolledCourses"
				);
				if (userDoc?.enrolledCourses?.length) {
					enrolledCourseIds = userDoc.enrolledCourses;
				}
			} catch (e) {
				console.warn("Fallback to user.enrolledCourses failed:", e?.message);
			}
		}

		if (!enrolledCourseIds.length) {
			return res.status(200).json({
				success: true,
				message: "No enrolled courses found",
				data: [],
			});
		}

		// Build session filter
		const filter = {
			course: { $in: enrolledCourseIds },
			isActive: true,
		};

		const now = new Date();

		if (upcoming === "true") {
			filter.scheduledDate = { $gte: now };
			filter.status = { $in: ["scheduled", "live"] };
		}

		if (completed === "true") {
			filter.status = "completed";
		}

		if (missed === "true") {
			filter.scheduledDate = { $lt: now };
			filter.status = { $in: ["scheduled"] };
		}

		const sessions = await CourseSession.find(filter)
			.populate("instructor", "name email avatar")
			.populate("course", "title description image")
			.sort({ scheduledDate: 1 });

		// Add student-specific attendance info
		const enrichedSessions = sessions.map((session) => {
			const attendance = session.attendedStudents.find(
				(att) => att.student.toString() === studentId.toString()
			);

			return {
				...session.toObject(),
				statusDisplay: session.statusDisplay,
				studentAttendance: attendance || null,
				hasAttended: !!attendance,
				canJoin:
					session.status === "live" ||
					(session.status === "scheduled" &&
						new Date(session.scheduledDate) <=
							new Date(Date.now() + 15 * 60 * 1000)), // 15 min before
			};
		});

		res.status(200).json({
			success: true,
			message: "Student sessions fetched successfully",
			data: enrichedSessions,
		});
	} catch (error) {
		console.error("Error fetching student sessions:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch student sessions",
			error: error.message,
		});
	}
};

// Join a live session (for students)
export const joinSession = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const studentId = req.user._id;
		const userRole = (req.user.role || "").toLowerCase();

		const session = await CourseSession.findById(sessionId).populate(
			"course",
			"title"
		);

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Determine if the requester is a host/admin (can bypass enrollment)
		const hostRoles = new Set(["admin", "instructor", "astrologer"]);
		const isHost = hostRoles.has(userRole);

		// For students, enforce enrollment in the course
		if (!isHost) {
			let isEnrolled = false;
			const enrollment = await Order.findOne({
				user: studentId,
				"items.itemId": session.course._id,
				"items.itemType": "course",
				paymentStatus: "paid",
			});
			isEnrolled = !!enrollment;

			// Fallback: check user's enrolledCourses list
			if (!isEnrolled) {
				try {
					const { default: User } = await import("../../model/UserModel.js");
					const userDoc = await User.findById(studentId).select(
						"enrolledCourses"
					);
					if (
						userDoc?.enrolledCourses?.some(
							(cid) => cid.toString() === session.course._id.toString()
						)
					) {
						isEnrolled = true;
					}
				} catch (e) {
					console.warn(
						"Fallback check user.enrolledCourses failed:",
						e?.message
					);
				}
			}

			// Fallback: check if session explicitly lists the student (e.g., pre-added)
			if (!isEnrolled && Array.isArray(session.enrolledStudents)) {
				isEnrolled = session.enrolledStudents.some(
					(uid) => uid.toString() === studentId.toString()
				);
			}

			if (!isEnrolled) {
				return res.status(403).json({
					success: false,
					message: "You are not enrolled in this course",
				});
			}
		}

		// Check if session is joinable
		const now = new Date();
		const sessionStart = new Date(session.scheduledDate);
		const joinWindow = 15 * 60 * 1000; // 15 minutes before start time

		if (!isHost) {
			// Students: allow joining immediately if session is live
			if (session.status === "live") {
				// ok
			} else if (session.status === "scheduled") {
				// Allow only within 15 mins before start
				if (sessionStart > new Date(now.getTime() + joinWindow)) {
					return res.status(400).json({
						success: false,
						message: "Session is not available for joining at this time",
					});
				}
			} else {
				return res.status(400).json({
					success: false,
					message: "Session is not available for joining at this time",
				});
			}
		} else {
			// Hosts: allow joining for scheduled or live sessions (block completed/cancelled)
			if (!["scheduled", "live"].includes(session.status)) {
				return res.status(400).json({
					success: false,
					message: "Hosts can only join scheduled or live sessions",
				});
			}
		}

		// For students only: mark attendance and update progress
		if (!isHost) {
			await session.markAttendance(studentId);

			const progress = await StudentProgress.findOne({
				student: studentId,
				course: session.course._id,
			});

			if (progress) {
				progress.sessionProgress.totalSessions =
					await CourseSession.countDocuments({
						course: session.course._id,
						isActive: true,
					});
				await progress.save();
			}
		}

		// Prepare Agora join details per-user (publisher role, deterministic uid)
		if (!session.agora) session.agora = {};
		const appId = process.env.AGORA_APP_ID;
		if (!appId) {
			return res.status(500).json({
				success: false,
				message: "Server misconfiguration: AGORA_APP_ID is missing",
			});
		}

		// Derive a deterministic 32-bit positive integer UID from user id
		const basis = (
			req.user?._id ||
			req.user?.email ||
			req.user?.id ||
			"0"
		).toString();
		let numericUid = 0;
		try {
			const hex = basis.replace(/[^0-9a-f]/gi, "");
			if (hex.length >= 8) {
				numericUid = parseInt(hex.slice(-8), 16);
			} else {
				numericUid = Array.from(basis)
					.map((c) => c.charCodeAt(0))
					.reduce((acc, v) => (acc * 33 + v) >>> 0, 5381);
			}
			// Bound to 1..2147482000 then add small role-based offset to avoid collisions
			numericUid = Math.max(1, numericUid % 2147482000);
		} catch (e) {
			console.warn("Failed to derive numeric UID, using fallback", e);
			numericUid = Math.floor(1 + Math.random() * 2147483000);
		}
		// Add tiny role-based offset (different ranges for host vs student)
		numericUid += isHost ? 101 : 202;
		numericUid = Math.min(numericUid, 2147483646);

		// If host joins, store host uid/name once for clients to label
		if (isHost) {
			try {
				session.agora.hostUid = numericUid;
				session.agora.hostName = req.user?.name || "Host";
				await session.save();
			} catch {}
		}

		let userToken = null;
		if (process.env.AGORA_APP_CERTIFICATE) {
			try {
				const { token } = generateRtcToken({
					appId,
					appCertificate: process.env.AGORA_APP_CERTIFICATE,
					channelName: session.agora.channelName,
					uid: numericUid,
					role: "publisher",
				});
				userToken = token;
			} catch (e) {
				console.error("Failed to generate Agora token for user:", e);
			}
		} else {
			console.warn(
				"AGORA_APP_CERTIFICATE not set — proceeding without token (testing mode)"
			);
		}

		// Return session join details
		res.status(200).json({
			success: true,
			message: "Session joined successfully",
			data: {
				sessionId: session._id,
				channelName: session.agora.channelName,
				appId,
				token: userToken,
				uid: numericUid,
				hostUid: session.agora.hostUid || null,
				hostName: session.agora.hostName || null,
				course: session.course,
				instructor: session.instructor,
				sessionTitle: session.title,
				startTime: session.actualStartTime || session.scheduledDate,
			},
		});
	} catch (error) {
		console.error("Error joining session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to join session",
			error: error.message,
		});
	}
};

// Leave a session (update attendance duration)
export const leaveSession = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const studentId = req.user._id;
		const { attendanceDuration, participationScore = 0 } = req.body;

		const session = await CourseSession.findById(sessionId);

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Update attendance record
		const attendance = session.attendedStudents.find(
			(att) => att.student.toString() === studentId.toString()
		);

		if (attendance) {
			attendance.leftAt = new Date();
			attendance.durationAttended = attendanceDuration || 0;
			attendance.participationScore = participationScore;
			await session.save();
		}

		// Update student progress
		const progress = await StudentProgress.findOne({
			student: studentId,
			course: session.course,
		});

		if (progress) {
			await progress.updateSessionAttendance(
				sessionId,
				true,
				attendanceDuration,
				participationScore
			);
		}

		res.status(200).json({
			success: true,
			message: "Session left successfully",
		});
	} catch (error) {
		console.error("Error leaving session:", error);
		res.status(500).json({
			success: false,
			message: "Failed to leave session",
			error: error.message,
		});
	}
};

// Get session recording (for both students and instructors)
export const getSessionRecording = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		const session = await CourseSession.findById(sessionId).populate(
			"course",
			"title"
		);

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Session not found",
			});
		}

		// Check access permissions
		if (userRole === "student") {
			// Check if student is enrolled
			const enrollment = await Order.findOne({
				user: userId,
				"items.itemId": session.course._id,
				"items.itemType": "course",
				paymentStatus: "paid",
			});

			if (!enrollment) {
				return res.status(403).json({
					success: false,
					message: "You are not enrolled in this course",
				});
			}
		}

		if (!session.recording.recordingUrl) {
			return res.status(404).json({
				success: false,
				message: "Recording not available for this session",
			});
		}

		// Increment view count
		session.totalViews += 1;
		await session.save();

		res.status(200).json({
			success: true,
			message: "Session recording fetched successfully",
			data: {
				sessionId: session._id,
				title: session.title,
				course: session.course,
				recordingUrl: session.recording.recordingUrl,
				duration: session.recording.recordingDuration,
				thumbnailUrl: session.recording.thumbnailUrl,
				downloadable: session.recording.downloadable,
				sessionDate: session.scheduledDate,
				actualDuration: session.actualDuration,
			},
		});
	} catch (error) {
		console.error("Error fetching session recording:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch session recording",
			error: error.message,
		});
	}
};
