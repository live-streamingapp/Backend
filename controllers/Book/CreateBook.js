import Book from "../../model/BookModel.js";
import cloudinary from "../../config/cloudinary.js";

const streamUpload = (buffer, folder = "books") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

export const createBook = async (req, res) => {
  try {
    // Handle cover image upload to Cloudinary
    let coverImageUrl = null;
    let coverPublicId = null;

    if (req.file && req.file.buffer) {
      const result = await streamUpload(req.file.buffer, "books");
      coverImageUrl = result.secure_url;
      coverPublicId = result.public_id;
    }

    // Parse nested objects/arrays from FormData
    let languageOptions = [];
    let highlights = {};
    let keyFeatures = [];
    let targetAudience = [];

    if (req.body.languageOptions) {
      languageOptions =
        typeof req.body.languageOptions === "string"
          ? JSON.parse(req.body.languageOptions)
          : req.body.languageOptions;
    }

    if (req.body.highlights) {
      highlights =
        typeof req.body.highlights === "string"
          ? JSON.parse(req.body.highlights)
          : req.body.highlights;
    }

    if (req.body.keyFeatures) {
      keyFeatures =
        typeof req.body.keyFeatures === "string"
          ? JSON.parse(req.body.keyFeatures)
          : req.body.keyFeatures;
    }

    if (req.body.targetAudience) {
      targetAudience =
        typeof req.body.targetAudience === "string"
          ? JSON.parse(req.body.targetAudience)
          : req.body.targetAudience;
    }

    const newBook = new Book({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      languageOptions,
      highlights,
      keyFeatures,
      targetAudience,
      coverImage: coverImageUrl,
      cloudinary_id: coverPublicId,
    });

    await newBook.save();

    res.status(201).json({
      status: true,
      code: 201,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error creating book",
      error: error.message,
    });
  }
};
