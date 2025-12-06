// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client with your Render environment variable
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route: Tarot Reading
app.post("/reading", async (req, res) => {
  try {
    const { cards, question } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({ error: "No cards provided." });
    }

    const prompt = `
You are a mystical AI tarot reader. Provide a clear but powerful reading.

User Question: ${question || "No question provided."}
Cards Drawn: ${cards.join(", ")}

Give a deep but friendly interpretation:
- What the cards reveal
- Emotional + spiritual guidance
- What to do next
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Tarot API Error:", error);
    res.status(500).json({ error: "Tarot reading failed." });
  }
});

// Default home route
app.get("/", (req, res) => {
  res.send("Tarot Backend Running Successfully 🌙🔮");
});

// Render requires dynamic PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
