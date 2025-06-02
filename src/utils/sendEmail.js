const nodemailer = require('nodemailer');

/**
 * Utility to send emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML format
 * @returns {Promise<boolean>} - True if email sent successfully
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"UROOM" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = sendEmail; 