import TicketModel from "../../model/TicketModel.js";

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await TicketModel.findByIdAndDelete(id);

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
      message: "Ticket deleted successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};
