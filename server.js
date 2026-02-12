const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROOT TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.status(200).send("Invictus Inquiry API Running ✅");
});

/* ================= SUBMIT ROUTE ================= */
app.post("/submit", async (req, res) => {

  console.log("Submit route hit ✅");

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    /* ================= EMAIL ================= */
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Inquiry - Invictus",
      html: `<h3>New Inquiry</h3>
             <p>Name: ${name}</p>
             <p>Email: ${email}</p>
             <p>Phone: ${phone}</p>
             <p>Message: ${message}</p>`
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You - Invictus Experiences",
      html: `<h3>Hello ${name},</h3>
             <p>Thank you for contacting us. We will connect soon.</p>`
    });

    /* ================= WHATSAPP ================= */
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: `Hello ${name} 👋\nThank you for contacting Invictus Experiences.`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Server Error" });
  }
});

/* ================= PORT (MANDATORY FOR RENDER) ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
