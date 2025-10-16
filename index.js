const express = require("express");
const crypto = require("crypto");
const app = express();

// Capture raw body
app.use(express.raw({ type: "*/*" }));



async function handleXeroPayload(parsedBody) {
  try {
    // Log all events locally
    parsedBody.events.forEach((event, i) => {
      console.log(`Event #${i + 1}`);
      console.log("Resource URL:", event.resourceUrl);
      console.log("Event Type:", event.eventType);
      console.log("Category:", event.eventCategory);
      console.log("Tenant ID:", event.tenantId);
    });

    // Send the entire payload to your Bubble API endpoint
    const bubbleUrl = "https://saqccfire.co.za/version-test/api/1.1/wf/xero-webhook/initialize"; // <-- replace this

    console.log("🚀 Sending data to Bubble...");

    const response = await fetch(bubbleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedBody),
    });

    const resultText = await response.text();
    console.log("✅ Bubble Response:", resultText);
  } catch (error) {
    console.error("❌ Error sending data to Bubble:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Umar Amjad - Server is running with webhook key ✅");
});

app.post("/xero-webhook", (req, res) => {
  try {

    
    console.log("📝 We are in SAQCC's Test XERO Account");
    
    const webhookKey = "UVNUi7YLWohgxY39vpvZyeFCxzLLbt8edk7MF9b5JNVLrrmq0xD4bZlwuW58hzI3V3YB5YHt2XFeDPw4AEG2hw==";
    const rawBody = req.body.toString("utf8");
let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = {};
    }

// ✅ CASE 1: Xero sends actual events
    if (parsedBody?.events?.length > 0) {
      console.log("📢 Received Events:", parsedBody.events.length);
      handleXeroPayload(parsedBody);
      return res.status(200).send("Events received");
    }

    // ✅ CASE 2: Validation ping (no events)
    console.log("ℹ️ No events in payload. Doing validation...");
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


app.post("/test", (req, res) => {
  try {
    const webhookKey = "UVNUi7YLWohgxY39vpvZyeFCxzLLbt8edk7MF9b5JNVLrrmq0xD4bZlwuW58hzI3V3YB5YHt2XFeDPw4AEG2hw==";
    const rawBody = req.body.toString("utf8");

 // ✅ Decode the base64 key first!

  //  const binaryKey = Buffer.from(webhookKey, "base64");


    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    const xeroSignature = req.header("x-xero-signature");

    console.log("📝 We are in Umar's Test XERO Account Not Actual");
    
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
