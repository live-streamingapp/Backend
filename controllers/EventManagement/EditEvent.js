import Event from "../../model/EventModel.js";

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Event not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(400).json({
      status: false,
      code: 400,
      message: "Failed to update event",
      error: error.message,
    });
  }
};
