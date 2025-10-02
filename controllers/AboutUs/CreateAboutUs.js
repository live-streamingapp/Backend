import AboutUs from "../../model/AboutUsModel.js";

export const createAboutUs = async (req, res) => {
  try {
    const { description, services, customerCareNumber, contactEmail, faqs } =
      req.body;

    const newAboutUs = new AboutUs({
      description,
      services,
      customerCareNumber,
      contactEmail,
      faqs,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newAboutUs.save();

    res.status(201).json({
      status: true,
      code: 201,
      message: "About Us created successfully",
      data: newAboutUs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error creating About Us",
      error: error.message,
    });
  }
};
