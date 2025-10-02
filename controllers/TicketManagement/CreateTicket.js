import TicketModel from "../../model/TicketModel.js";
import QRCode from "qrcode";

export const createTicket = async (req, res) => {
  try {
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

    const newTicket = new TicketModel({
      eventTitle,
      eventDate,
      time,
      venue,
      ticketStatus,
      quantity,
      amount,
      paymentStatus,
    });

    await newTicket.save();

    const qrCodeBase64 = await QRCode.toDataURL(
      JSON.stringify({
        id: newTicket._id,
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

    newTicket.qrCodeData = qrCodeBase64;
    await newTicket.save();

    res.status(201).json({
      status: true,
      code: 201,
      message: "Ticket created successfully",
      data: newTicket,
      qrCode: qrCodeBase64,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};
