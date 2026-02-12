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

    await transporter.verify();   // SMTP connection check

    res.send("Zoho SMTP Connected Successfully ✅");

  } catch (error) {
    console.error(error);
    res.status(500).send("Zoho SMTP Connection Failed ❌");
  }
});
