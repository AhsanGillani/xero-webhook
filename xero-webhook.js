// xero-webhook.js
import express from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Replace this with your actual Xero webhook signing key
const XERO_SIGNING_KEY = process.env.XERO_SIGNING_KEY || "YOUR_XERO_WEBHOOK_SIGNING_KEY";

// ⚠️ We must capture the *raw body* for signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// ✅ Webhook endpoint (the one you register in Xero)
app.post("/xero-webhook", (req, res) => {
  try {
    const rawBody = req.rawBody;
    const xeroSignature = req.headers["x-xero-signature"];

    // Create HMAC SHA256 signature
    const computedSignature = crypto
      .createHmac("sha256", XERO_SIGNING_KEY)
      .update(rawBody, "utf8")
      .digest("base64");

    const isValid = computedSignature === xeroSignature;

    if (isValid) {
      console.log("✅ Xero signature verified.");
      return res.status(200).json({
        status: "ok",
        message: "Signature verified. Intent to receive successful.",
      });
    } else {
      console.log("❌ Invalid Xero signature!");
      return res.status(401).json({
        status: "error",
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("⚠️ Error verifying webhook:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Xero Webhook server running on port ${PORT}`);
});
