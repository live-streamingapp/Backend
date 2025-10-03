import Course from "../../model/CourseModel.js";
import cloudinary from "../../config/cloudinary.js";
import { normaliseCoursePayload } from "../../utils/coursePayload.js";

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

export const editCourse = async (req, res) => {
	try {
		const { id } = req.params;
		let payload = req.body ?? {};
		if (req.body?.payload) {
			try {
				payload = JSON.parse(req.body.payload);
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

		const updates = normaliseCoursePayload(payload);

		if (req.files?.image?.[0]?.buffer) {
			const result = await uploadToCloudinary(
				req.files.image[0].buffer,
				"courses",
				"image"
			);
			updates.image = result.secure_url;
			updates.cloudinary_course_id = result.public_id;
		}

		if (updates.courseContent?.length && req.files?.videos?.length) {
			const updatedContent = [];
			for (let i = 0; i < updates.courseContent.length; i++) {
				const lesson = updates.courseContent[i];
				const file = req.files.videos[i]; // match video by index
				if (file && file.buffer) {
					const result = await uploadToCloudinary(
						file.buffer,
						"course_videos",
						"video"
					);
					lesson.video = result.secure_url;
					lesson.cloudinary_video_id = result.public_id;
				}
				updatedContent.push(lesson);
			}
			updates.courseContent = updatedContent;
		}

		const updatedCourse = await Course.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedCourse) {
			return res.status(404).json({
				status: "false",
				code: "404",
				message: "Course not found",
				data: {},
			});
		}

		res.status(200).json({
			status: "true",
			code: "200",
			message: "Course updated successfully",
			data: updatedCourse,
		});
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(400).json({
			status: "false",
			code: "400",
			message: "Error updating course",
			data: {},
			error: error.message,
		});
	}
};
