import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv/;

  const ext = file.originalname.split(".").pop().toLowerCase();

  if (allowedImageTypes.test(ext) || allowedVideoTypes.test(ext)) {
    cb(null, true);
  } else {
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
