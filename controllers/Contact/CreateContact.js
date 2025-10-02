import nodemailer from "nodemailer";
import Contact from "../../model/ContactModel.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, phone, country, city, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      country,
      city,
      message,
    });
    await newContact.save();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_MAIL,
        pass: process.env.CONTACT_MAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_MAIL,
      subject: "New Contact Form Submission",
      html: `
        <h3>New Message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      status: true,
      code: 201,
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
