import Event from "../../model/EventModel.js";

export const getEvents = async (req, res) => {
  try {
    const { topic, isVirtual, upcoming } = req.query;
    let filter = {};

    if (topic) filter.topics = { $regex: topic, $options: "i" };
    if (isVirtual) filter.isVirtual = isVirtual === "true";
    if (upcoming) filter.startTime = { $gte: new Date() };

    const events = await Event.find(filter).sort({ startTime: 1 });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Events fetched successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

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
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};
