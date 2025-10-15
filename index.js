const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const app = express();

// Middleware: capture raw body exactly as received
app.use(express.raw({ type: "*/*" }));

// Test endpoint
app.get("/", (req, res) => {
  res.send("Umar Amjad - Server is runninggggggggggg ✅");
});

app.post("/xero-webhook", (req, res) => {
  try {
    const webhookKey = "UVNUi7YLWohgxY39vpvZyeFCxzLLbt8edk7MF9b5JNVLrrmq0xD4bZlwuW58hzI3V3YB5YHt2XFeDPw4AEG2hw==";

    // 1️⃣ Raw request body (as UTF-8 string)
    const rawBody = req.body.toString("utf8");

    // 2️⃣ Compute HMAC-SHA256 + Base64
    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    // 3️⃣ Signature from Xero
    const xeroSignature = req.header("x-xero-signature");

    // 4️⃣ Log everything
    const logData = {
      timestamp: new Date().toISOString(),
      headers: req.headers,
      rawBody,
      computedSignature,
      xeroSignature,
    };

    console.log("🪵 XERO WEBHOOK LOG:", JSON.stringify(logData, null, 2));

    // Optionally save logs to file (only works locally, not on Vercel)
    try {
      fs.appendFileSync("xero-webhook-log.txt", JSON.stringify(logData, null, 2) + "\n\n");
    } catch (e) {
      console.log("⚠️ Log file not writable (likely on Vercel)");
    }

    // 5️⃣ Compare signatures safely
    if (
      xeroSignature &&
      crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(xeroSignature)
      )
    ) {
      console.log("✅ Signature Match - sending 200 OK");
      return res.status(200).send("Signature verified. Intent to receive successful.");
    } else {
      console.log("❌ Signature Mismatch - sending 401 Unauthorized");
      return res.status(401).send("Invalid signature.");
    }
  } catch (error) {
    console.error("💥 Error verifying signature:", error);
    return res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Xero Webhook listening on port ${PORT}`));
