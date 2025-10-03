import Course from "../../model/CourseModel.js";
import cloudinary from "../../config/cloudinary.js";
import { normaliseCoursePayload } from "../../utils/coursePayload.js";

// Upload file (image or video) to Cloudinary
const uploadToCloudinary = async (
	fileBuffer,
	folder,
	resourceType = "auto"
) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{ folder, resource_type: resourceType },
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			)
			.end(fileBuffer);
	});
};

export const createCourse = async (req, res) => {
	try {
		let coursePayload = req.body ?? {};
		if (req.body?.payload) {
			try {
				coursePayload = JSON.parse(req.body.payload);
			} catch (error) {
				return res.status(400).json({
					status: "false",
					code: "400",
					message: "Invalid course payload provided.",
					data: {},
					error: error.message,
				});
			}
		}

		const courseData = normaliseCoursePayload(coursePayload);

		// 1️⃣ Upload course image if exists
		if (req.files?.image?.[0]?.buffer) {
			const result = await uploadToCloudinary(
				req.files.image[0].buffer,
				"courses",
				"image"
			);
			courseData.image = result.secure_url;
			courseData.cloudinary_course_id = result.public_id;
		}

		// 2️⃣ Handle courseContent with videos
		if (courseData.courseContent?.length && req.files?.videos) {
			const uploadedContent = [];
			for (let i = 0; i < courseData.courseContent.length; i++) {
				const lesson = courseData.courseContent[i];
				const file = req.files.videos[i]; // match video to lesson by index
				if (file && file.buffer) {
					const result = await uploadToCloudinary(
						file.buffer,
						"course_videos",
						"video"
					);
					lesson.video = result.secure_url;
					lesson.cloudinary_video_id = result.public_id;
				}
				uploadedContent.push(lesson);
			}
			courseData.courseContent = uploadedContent;
		}

		// 3️⃣ Save course
		const course = new Course(courseData);
		await course.save();

		res.status(201).json({
			status: "true",
			code: "201",
			message: "Course created successfully",
			data: course,
		});
	} catch (error) {
		console.error("Error creating course:", error);
		res.status(400).json({
			status: "false",
			code: "400",
			message: "Error creating course",
			data: {},
			error: error.message,
		});
	}
};
