import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.send("Tarot backend is live ✨");
});

// Tarot reading endpoint
app.post("/api/interpret", async (req, res) => {
  try {
    const { spreadType, question, cards } = req.body || {};

    const spreadLabel = spreadType || "3-card spread";
    const safeQuestion =
      question && question.trim().length > 0
        ? question.trim()
        : "No specific question. Give a general guidance reading.";

    const cardsText = Array.isArray(cards)
      ? cards
          .map((c, i) => {
            const pos = c.position || `Card ${i + 1}`;
            const name = c.name || "Unknown card";
            const meaning = c.meaning || "";
            return `${pos}: ${name} — ${meaning}`;
          })
          .join("\n")
      : "No card details provided.";

    const prompt = `
