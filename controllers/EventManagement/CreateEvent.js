import Event from "../../model/EventModel.js";

export const createEvent = async (req, res) => {
  try {
    const { body, file } = req;

    const event = new Event({
      ...body,
      thumbnail: file ? `/uploads/${file.filename}` : null,
      createdBy: req.user?._id || null,
    });

    await event.save();

    res.status(201).json({
      status: true,
      code: 201,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to create event",
      error: error.message,
    });
  }
};
