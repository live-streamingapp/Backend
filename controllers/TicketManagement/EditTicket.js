import TicketModel from "../../model/TicketModel.js";
import QRCode from "qrcode";

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      eventTitle,
      eventDate,
      time,
      venue,
      ticketStatus,
      quantity,
      amount,
      paymentStatus,
    } = req.body;

    const ticket = await TicketModel.findByIdAndUpdate(
      id,
      {
        eventTitle,
        eventDate,
        time,
        venue,
        ticketStatus,
        quantity,
        amount,
        paymentStatus,
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Ticket not found",
        data: null,
      });
    }

    // Generate updated QR code
    const qrCodeBase64 = await QRCode.toDataURL(
      JSON.stringify({
        id: ticket._id,
        eventTitle,
        eventDate,
        time,
        venue,
        ticketStatus,
        quantity,
        amount,
        paymentStatus,
      })
    );

    ticket.qrCodeData = qrCodeBase64;
    await ticket.save();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Ticket updated successfully",
      data: ticket,
      qrCode: qrCodeBase64,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};
