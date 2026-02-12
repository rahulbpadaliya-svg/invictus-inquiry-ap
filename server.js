const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROOT ROUTE ================= */
app.get("/", (req, res) => {
  res.status(200).send("Invictus Email API Running ✅");
});

/* ================= SMTP TEST ROUTE ================= */
app.get("/test-email", async (req, res) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();

    res.status(200).send("Zoho SMTP Connected Successfully ✅");

  } catch (error) {
    console.error("SMTP Error:", error.message);
    res.status(500).send("Zoho SMTP Connection Failed ❌");
  }
});

/* ================= SUBMIT ROUTE ================= */
app.post("/submit", async (req, res) => {

  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Instant response (fix timeout)
  res.status(200).json({ success: true });

  // Background email sending
  (async () => {
    try {

      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Owner Email
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

      // User Email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thank You - Invictus Experiences",
        html: `
          <h3>Hello ${name},</h3>
          <p>Thank you for contacting Invictus Experiences.</p>
          <p>Our team will connect with you shortly.</p>
          <br>
          <p><b>Invictus Experiences</b></p>
        `
      });

      console.log("Emails sent successfully ✅");

    } catch (error) {
      console.error("Email Error:", error.message);
    }
  })();

});

/* ================= PORT ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
