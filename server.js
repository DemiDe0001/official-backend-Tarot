import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple health check route
app.get("/", (req, res) => {
  res.send("Arcana tarot backend is live ✨");
});

app.post("/api/interpret", async (req, res) => {
  try {
    const { spreadType, question, cards, prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Missing prompt in request body." });
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return res
        .status(400)
        .json({ error: "Cards array is required and cannot be empty." });
    }

    console.log("🔮 /api/interpret hit with:", {
      spreadType,
      question,
      cardsCount: cards.length,
    });

  
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, grounded, empowering tarot reader. You avoid medical, legal, or strict financial advice. You speak in encouraging, reflective language and never sound fatalistic.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const reading = completion?.choices?.[0]?.message?.content?.trim();

    if (!reading) {
      console.error("❌ No reading content returned from OpenAI");
      return res
        .status(500)
        .json({ error: "AI did not return a reading text." });
    }

    res.json({ reading });
  } catch (err) {
    console.error("💥 Error in /api/interpret:", err);
    res
      .status(500)
      .json({ error: "Failed to generate reading from the AI backend." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✨ Arcana backend listening on port ${PORT}`);
});
