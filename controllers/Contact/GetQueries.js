import Contact from "../../model/ContactModel.js";

export const getQueries = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Contact queries fetched successfully",
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contact queries:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
