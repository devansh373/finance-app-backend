


// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// import { Document } from "@langchain/core/documents";

// export async function setupChroma() {
//   const embeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey: process.env.CHATBOT_API_KEY!,
//     model: "text-embedding-004",
//   });

//   const docs = [
//      new Document({
//       pageContent: "TCS reported a 12% increase in revenue in Q4 2024.",
//       metadata: { company: "TCS", source: "financial_report" },
//     }),
//     new Document({
//       pageContent: "Infosys saw a 15% profit growth year over year.",
//       metadata: { company: "Infosys", source: "news_article" },
//     }),
//     new Document({
//       pageContent: "HDFC Bank maintained a strong NPA ratio below 1%.",
//       metadata: { company: "HDFC Bank", source: "financial_review" },
//     }),
  
//   ];

//   // ✅ Connect to the running Chroma server
//   const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
//     collectionName: "finance-data",
//     url: "http://localhost:8000",   // <-- key line
//   });

//   console.log("✅ Connected to Chroma server at http://localhost:8000");
//   return vectorStore;
// }


import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

const CHROMA_URL = "http://localhost:8000";
const COLLECTION_NAME = "finance-data";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.CHATBOT_API_KEY!,
  model: "text-embedding-004",
});

// 1️⃣ Initialize & insert documents only ONCE
export async function initializeChroma() {
  const docs = [
    new Document({
      pageContent: "TCS reported a 12% increase in revenue in Q4 2024.",
      metadata: { company: "TCS", source: "financial_report" },
    }),
    new Document({
      pageContent: "Infosys reported a 15% profit growth and 8% revenue increase in Q4 2024.",
      metadata: { company: "Infosys", source: "financial_report" },
    }),
    new Document({
      pageContent: "Wipro had a 10% revenue growth but decreased profit in Q4 2024.",
      metadata: { company: "Wipro", source: "financial_report" },
    }),
  ];

  const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });

  console.log("✅ Chroma initialized & data stored");
  return vectorStore;
}

// 2️⃣ Later, just connect without re-embedding
export async function getChromaStore() {
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });
  return vectorStore;
}
