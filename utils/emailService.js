import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();
const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";
const FROM_EMAIL =
  process.env.FROM_EMAIL || "VastuGuru <noreply@vastuguru.com>";

/**
 * Send email using Mailgun
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version (optional)
 * @param {string} options.html - HTML version (optional)
 * @returns {Promise} - Mailgun response
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Validate required environment variables
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.error("⚠️ Mailgun credentials not configured");
      throw new Error("Email service not configured. Please contact support.");
    }

    const emailData = {
      from: FROM_EMAIL,
      to: to,
      subject: subject,
    };

    // Add text or html content
    if (html) {
      emailData.html = html;
    }
    if (text) {
      emailData.text = text;
    }

    // If neither text nor html provided, throw error
    if (!text && !html) {
      throw new Error("Email must have either text or html content");
    }

    // Send email
    const response = await mg.messages.create(MAILGUN_DOMAIN, emailData);

    console.log("✅ Email sent successfully:", {
      to: to,
      subject: subject,
      messageId: response.id,
    });

    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - OTP code
 */
export const sendOtpEmail = async (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Verify Your Email - VastuGuru",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #bb1201;">Welcome to VastuGuru!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address to complete your registration.</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #bb1201; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">VastuGuru - Your Guide to Vastu, Astrology & Numerology</p>
      </div>
    `,
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Password reset URL
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  return sendEmail({
    to: email,
    subject: "Password Reset Request - VastuGuru",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #bb1201;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #bb1201; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">VastuGuru - Your Guide to Vastu, Astrology & Numerology</p>
      </div>
    `,
  });
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 */
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Welcome to VastuGuru! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #bb1201;">Welcome to VastuGuru!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created. We're excited to have you join our community!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our courses on Vastu, Astrology, and Numerology</li>
          <li>Book consultations with our experts</li>
          <li>Access exclusive content and resources</li>
          <li>Connect with our community</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/dashboard" style="background-color: #bb1201; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">VastuGuru - Your Guide to Vastu, Astrology & Numerology</p>
      </div>
    `,
  });
};
