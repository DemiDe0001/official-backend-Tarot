import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/tarot", async (req, res) => {
  try {
    const { question, cards } = req.body;

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a tarot interpreter. Provide clear, uplifting meanings based on the drawn cards."
        },
        {
          role: "user",
          content: `Question: ${question}. Cards: ${JSON.stringify(cards)}`
        }
      ]
    });

    res.json({
      reading: aiResponse.choices[0].message.content
    });
  } catch (error) {
    console.error("Tarot reading error:", error);
    res.status(500).json({ error: "Failed to generate tarot reading." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
