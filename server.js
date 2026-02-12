const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("Invictus Inquiry API Running ✅");
});

/* ================= SUBMIT ROUTE ================= */
app.post("/submit", async (req, res) => {
  try {

    const { name, email, phone, message } = req.body;

    /* ===== Basic Validation ===== */
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    /* ================= EMAIL SETUP ================= */
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    /* ===== Send Email to Owner ===== */
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Inquiry - Invictus Experiences",
      html: `
        <h2>New Inquiry Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    /* ===== Send Email to User ===== */
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You for Contacting Invictus Experiences",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for your inquiry. Our team will contact you shortly.</p>
        <br>
        <p><b>Invictus Experiences</b></p>
      `
    });

    /* ================= WHATSAPP SEND ================= */
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: `Hello ${name} 👋

Thank you for contacting Invictus Experiences.
Our team will connect with you shortly!`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

/* ================= PORT (IMPORTANT FOR RENDER) ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
