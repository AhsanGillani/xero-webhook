const express = require("express");
const crypto = require("crypto");
const app = express();
const axios = require("axios");

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

    console.log("🚀 Sending data to Bubble...");

    const response = await axios.post("https://saqccfire.co.za/version-test/api/1.1/wf/xero-webhook",
      {
        test: true,
        source: "vercel",
        message: "Hello from SAQCC live server",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );

    console.log("✅ Bubble Response:", response.data);
  } catch (error) {
    if (error.response) {
      // Bubble replied with error code (4xx, 5xx)
      console.error("❌ Bubble Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      // No response received
      console.error("❌ No response from Bubble:", error.message);
    } else {
      // Setup error (bad URL, network issue, etc.)
      console.error("💥 Axios setup error:", error.message);
    }
  }
}


app.get("/", (req, res) => {
  res.send("Umar Amjad - Server is running with webhook key ✅");
});

app.post("/xero-webhook", (req, res) => {
  try {


    console.log("📝 We are in SAQCC's Actual XERO Account");

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




//The following is just for tetsing to know. Original one is above

app.post("/test", (req, res) => {
  try {
    const webhookKey = "lbd1kg0bOJpWYKO4Z0n6VYl5Yh30lxJ29/cDPSXtYGnWl7BJKL/UkoOvpkMCZGeNldEjgFkx71UgeLsuwt5Vyw==";
    const rawBody = req.body.toString("utf8");

    // ✅ Decode the base64 key first!

    //  const binaryKey = Buffer.from(webhookKey, "base64");


    const computedSignature = crypto
      .createHmac("sha256", webhookKey)
      .update(rawBody)
      .digest("base64");

    const xeroSignature = req.header("x-xero-signature");

    console.log("📝 We are in Umar's Test XERO Account");

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


app.get("/ping-bubble", async (req, res) => {
  try {
    console.log("Request to ping to bubble");

    const response = await axios.post("https://saqccfire.co.za/version-test/api/1.1/wf/xero-webhook/initialize",
      {
        test: true,
        source: "vercel",
        message: "Hello from SAQCC live server",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );
    res.json({ status: response.status, data: response.data });
  } catch (err) {
    res.json({ error: err.message, code: err.code });
  }
});



app.listen(3000, () => console.log("🚀 Xero webhook listening on port 3000"));
