import upload from "./upload.js";

// Middleware wrapper to make file upload optional
export const optionalSingleUpload = (fieldName) => {
	return (req, res, next) => {
		const uploadMiddleware = upload.single(fieldName);

		uploadMiddleware(req, res, (err) => {
			// If error is about missing file, ignore it and continue
			if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
				return next();
			}
			// If error is about file type and there's actually no file, ignore it
			if (err && !req.file) {
				return next();
			}
			// For other errors, pass them along
			if (err) {
				return next(err);
			}
			// No error, continue
			next();
		});
	};
};

export default optionalSingleUpload;
