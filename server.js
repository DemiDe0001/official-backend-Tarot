import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables from Render / .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple health-check route
app.get("/", (req, res) => {
  res.send("Tarot backend is live ✨");
});

// Set up OpenAI client (make sure OPENAI_API_KEY is set in Render)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Main tarot reading endpoint
app.post("/api/interpret", async (req, res) => {
  try {
    const { spreadType, question, cards } = req.body;

    const spreadText = spreadType || "3-card Past / Present / Future";

    const cardSummary = Array.isArray(cards)
      ? cards
          .map((card, i) => {
            const pos = card.position || `Card ${i + 1}`;
            const name = card.name || "Unknown card";
            const meaning = card.meaning || "";
            return `${pos}: ${name} – ${meaning}`;
          })
          .join("\n")
      : "No card details provided.";

    const userQuestion = question || "No specific question; give a general reading.";

    const prompt = `
You are an intuitive, kind tarot reader.

Spread type: ${spreadText}
Question / focus: ${userQuestion}

Cards drawn:
${cardSummary}

Please:
1. Give a short overall theme of the reading.
2. Give 2–3 paragraphs of insight in plain language.
3. Finish with 2–3 practical action steps.
Keep it supportive and grounded, not doom-y or overly mystical.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text =
      response.output?.[0]?.content?.[0]?.text ||
      "I’m sorry, I couldn’t generate a reading.";

    res.json({ interpretation: text });
  } catch (err) {
    console.error("Error in /api/interpret:", err);
    res.status(500).json({
      error: "Failed to generate tarot reading.",
      details: err.message || String(err),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Tarot backend listening on port ${PORT}`);
});
