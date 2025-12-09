// server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.send("Arcana backend is live.");
});

// 🔮 Tarot AI interpret endpoint
app.post("/api/interpret", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a kind, grounded, intuitive tarot reader. You explain cards gently and practically.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 700,
    });

    const reading =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I couldn’t tune into this spread, please try again with a clearer question.";

    res.json({ reading });
  } catch (err) {
    console.error("Error in /api/interpret:", err);
    res.status(500).json({ error: "Failed to generate reading." });
  }
});

// 💌 Membership signup endpoint
app.post("/api/membership", async (req, res) => {
  try {
    const {
      name,
      email,
      street,
      city,
      state,
      zip,
      zodiac,
      usage,
    } = req.body;

    if (!name || !email || !street || !city || !state || !zip) {
      return res.status(400).json({
        error: "Missing required fields (name, email, address).",
      });
    }

    // For now we just log the membership data.
    // 🔗 Later you can:
    // - save to a database (Supabase, MongoDB, PostgreSQL, etc.)
    // - send a notification email to yourself
    // - trigger a welcome email flow
    console.log("🆕 New Arcana Membership signup:", {
      name,
      email,
      street,
      city,
      state,
      zip,
      zodiac,
      usage,
      createdAt: new Date().toISOString(),
    });

    // Respond back to the frontend
    res.json({
      success: true,
      message:
        "Membership details received. Connect this endpoint to your database + payment system next.",
    });
  } catch (err) {
    console.error("Error in /api/membership:", err);
    res.status(500).json({
      error: "Failed to process membership. Please try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Arcana backend listening on port ${port}`);
});
