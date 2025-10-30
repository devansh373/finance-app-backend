import express, { Request, Response } from "express";
// import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize Gemini client

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    // ✅ Dynamically import the ESM module
    const { GoogleGenAI } = await import("@google/genai");
    
    const genAI = new GoogleGenAI({
      apiKey: process.env.CHATBOT_API_KEY!,
    });

    // Use the latest lightweight Gemini model (Oct 2025)
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    const reply = result.text;
    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Gemini SDK error:", err);
    res.status(500).json({
      error: err.message || "Failed to get response from Gemini",
    });
  }
});

export default router;
