import TicketModel from "../../model/TicketModel.js";

// GET all tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await TicketModel.find();
    res.status(200).json({
      status: true,
      code: 200,
      message: "Tickets retrieved successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to retrieve tickets",
      error: error.message,
    });
  }
};

// GET single ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await TicketModel.findById(id);

    if (!ticket) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Ticket not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket retrieved successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to retrieve ticket",
      error: error.message,
    });
  }
};
