// import express, { Request, Response } from "express";
// // import { GoogleGenAI } from "@google/genai";

// const router = express.Router();

// // Initialize Gemini client

// router.post("/", async (req: Request, res: Response) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }
//     // ✅ Dynamically import the ESM module
//     const { GoogleGenAI } = await import("@google/genai");
    
//     const genAI = new GoogleGenAI({
//       apiKey: process.env.CHATBOT_API_KEY!,
//     });

//     // Use the latest lightweight Gemini model (Oct 2025)
//     const result = await genAI.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: [{ role: "user", parts: [{ text: message }] }],
//     });

//     const reply = result.text;
//     res.status(200).json({ reply });
//   } catch (err: any) {
//     console.error("Gemini SDK error:", err);
//     res.status(500).json({
//       error: err.message || "Failed to get response from Gemini",
//     });
//   }
// });

// export default router;


// import express, { Request, Response } from "express";
// import { chatWithRAG } from "../chatbot"; // ✅ Import your existing RAG logic

// const router = express.Router();

// router.post("/", async (req: Request, res: Response) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     // ✅ Call your existing RAG logic
//     const answer = await chatWithRAG(message);

//     // If chatWithRAG() returns a LangChain Response object, extract text
//     const reply =
//       typeof answer === "string"
//         ? answer
//         : (answer.response?.text?.() ?? answer.toString?.() ?? "No response");

//     res.status(200).json({ reply });
//   } catch (err: any) {
//     console.error("RAG Chat error:", err);
//     res.status(500).json({
//       error: err.message || "Failed to get RAG-based response",
//     });
//   }
// });

// export default router;


import express, { Request, Response } from "express";
import { chatWithRAG } from "../chatbot";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1️⃣ Call your existing RAG logic
    const answer = await chatWithRAG(message);

    // 2️⃣ Extract text safely
    // `AIMessageChunk` objects have a `.content` field that can be string or array
    let reply = "";

    if (typeof answer === "string") {
      reply = answer;
    } else if (Array.isArray(answer.content)) {
      reply = answer.content
        .map((chunk: any) => chunk.text || "")
        .join("")
        .trim();
    } else if (typeof answer.content === "string") {
      reply = answer.content.trim();
    } else {
      reply = JSON.stringify(answer);
    }

    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("RAG Chat error:", err);
    res.status(500).json({
      error: err.message || "Failed to get RAG-based response",
    });
  }
});

export default router;
