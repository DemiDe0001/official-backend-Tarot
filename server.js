// server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Make sure this env var is set in Render
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple health check
app.get("/", (req, res) => {
  res.send("Arcana tarot backend is live ✨");
});

// This MUST match your frontend: POST /api/interpret
app.post("/api/interpret", async (req, res) => {
  try {
    const { spreadType, question, cards, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, grounded tarot reader. You speak in an empowering, non-scary way.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const reading = completion.choices[0]?.message?.content?.trim();

    if (!reading) {
      return res
        .status(500)
        .json({ error: "AI did not return a reading text." });
    }

    // 👈 THIS matches what your frontend expects
    res.json({ reading });
  } catch (err) {
    console.error("Error in /api/interpret:", err);
    res
      .status(500)
      .json({ error: "Failed to generate reading. Check server logs." });
  }
});

// Render needs this PORT setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Arcana backend listening on port ${PORT}`);
});
