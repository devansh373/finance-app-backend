import { getChromaStore } from "./ragSetup";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function chatWithRAG(userQuestion: string) {
  // const vectorStore = await setupChroma();
  const vectorStore = await getChromaStore();

  // Step 1: Retrieve similar documents
  const similarDocs = await vectorStore.similaritySearch(userQuestion, 2);
  const context = similarDocs.map((doc) => doc.pageContent).join("\n");

  // Step 2: Initialize Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-lite",
    apiKey: process.env.CHATBOT_API_KEY!,
  });

  // Step 3: Combine context + question into a single prompt
  const prompt = `
  You are a financial assistant. Use the following context to answer the question:
  Context: ${context}
  Question: ${userQuestion}
  Answer:
  `;

  // Step 4: Generate response
  const response = await model.invoke(prompt);
  console.log("🤖 Gemini:", response);
  return response;
}
