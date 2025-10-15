// xeroWebhook.js
const express = require("express");
const crypto = require("crypto");
const app = express();

// Middleware to capture raw body exactly as received
app.use(express.raw({ type: "*/*" }));


// Simple test endpoint
app.get("/", (req, res) => {
  res.send("Umar Amjad - Server is running ✅");
});


app.post("/xero-webhook", (req, res) => {
  try {
    // Your Xero Webhook Key (from developer portal)
    const webhookKey = "UVNUi7YLWohgxY39vpvZyeFCxzLLbt8edk7MF9b5JNVLrrmq0xD4bZlwuW58hzI3V3YB5YHt2XFeDPw4AEG2hw==";

    // Get the raw payload
    const rawBody = req.body.toString("utf8");

    // Compute HMAC-SHA256 with base64 encoding
    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    // Get the signature sent by Xero
    const xeroSignature = req.header("x-xero-signature");

    console.log("Computed Signature:", computedSignature);
    console.log("Xero Signature:", xeroSignature);

    // Compare securely
    if (
      xeroSignature &&
      crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(xeroSignature)
      )
    ) {
      console.log("✅ Signature Match");
      return res.status(200).send("Signature verified. Intent to receive successful.");
    } else {
      console.log("❌ Signature Mismatch");
      return res.status(401).send("Invalid signature.");
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    return res.status(500).send("Server error");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Xero Webhook listening on port ${PORT}`));
