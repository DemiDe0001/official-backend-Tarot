import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client using your Render environment variable
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route
app.get("/", (req, res) => {
  res.send("Tarot backend is live ✨");
});

// Main tarot reading route
app.post("/reading", async (req, res) => {
  try {
    const { cards, question } = req.body || {};

    const safeQuestion =
      question && question.trim().length > 0
        ? question.trim()
        : "No specific question. Give general guidance.";

    const cardList = Array.isArray(cards)
      ? cards.join(", ")
      : JSON.stringify(cards);

    const prompt = `
You are an intuitive, kind tarot reader.
Give a clear, empowering reading based on the user's question and cards.

Question: ${safeQuestion}
Cards: ${cardList}

Structure:
1. Overall energy (2–3 sentences)
2. What the cards are trying to tell them
3. 3–5 practical next steps
Keep it encouraging. No doom, no scary predictions.
    `.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text =
      response.output?.[0]?.content?.[0]?.text ||
      "I sense a turning point ahead. Trust your intuition and stay open to small changes you can control.";

    res.json({ reading: text });
  } catch (err) {
    console.error("Tarot AI error:", err);
    res.status(500).json({ error: "Failed to generate tarot reading." });
  }
});

// Use Render's port or default to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tarot backend listening on port ${PORT}`);
});
