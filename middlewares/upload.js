import multer from "multer";
import path from "path";

// Use memory storage for Cloudinary uploads (stores files in buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	console.log("FileFilter called with:", {
		fieldname: file.fieldname,
		originalname: file.originalname,
		mimetype: file.mimetype,
	});

	// Skip validation for non-file fields or empty files
	if (!file || !file.originalname || file.originalname.trim() === "") {
		console.log("Rejecting empty or invalid file");
		return cb(null, false); // Reject empty files silently
	}

	const allowedImageTypes = /jpeg|jpg|png|webp/;
	const allowedVideoTypes = /mp4|mov|avi|mkv/;

	const ext = file.originalname.split(".").pop().toLowerCase();

	if (allowedImageTypes.test(ext) || allowedVideoTypes.test(ext)) {
		console.log("File accepted:", file.originalname);
		cb(null, true);
	} else {
		console.log("File rejected - invalid extension:", ext);
		cb(
			new Error(
				"Only images (.jpeg, .jpg, .png, .webp) and videos (.mp4, .mov, .avi, .mkv) are allowed"
			),
			false
		);
	}
};
const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
});

export default upload;
