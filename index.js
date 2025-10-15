const express = require("express");
const crypto = require("crypto");
const app = express();

// Capture raw body
app.use(express.raw({ type: "*/*" }));


app.get("/", (req, res) => 
  { 
    res.send("Umar Amjad - Server is running with reference of php ✅"); 
  });

app.post("/xero-webhook", (req, res) => {
  try {
    const webhookKey = "YOUR_XERO_WEBHOOK_KEY";
    const rawBody = req.body.toString("utf8");

    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    const xeroSignature = req.header("x-xero-signature");

    console.log("🧠 Raw Body:", rawBody);
    console.log("🧾 Computed:", computedSignature);
    console.log("📦 Xero Header:", xeroSignature);

    if (!xeroSignature) return res.status(400).send("Missing signature");

    const computedBuffer = Buffer.from(computedSignature);
    const xeroBuffer = Buffer.from(xeroSignature);

    if (computedBuffer.length !== xeroBuffer.length) {
      console.log("⚠️ Signature length mismatch");
      return res.status(401).send("Invalid signature (length mismatch)");
    }

    if (crypto.timingSafeEqual(computedBuffer, xeroBuffer)) {
      console.log("✅ Signature verified successfully!");
      return res.status(200).send("Intent to receive");
    } else {
      console.log("❌ Signature mismatch");
      return res.status(401).send("Invalid signature");
    }
  } catch (error) {
    console.error("💥 Error verifying signature:", error);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => console.log("🚀 Xero webhook listening on port 3000"));
