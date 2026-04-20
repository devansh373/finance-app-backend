


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


import { ChromaClient } from "chromadb";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

const COLLECTION_NAME = "finance-data";

// 0️⃣ Pre-configure ChromaClient to bypass Langchain's noisy defaults
const chromaClient = new ChromaClient({
  host: "localhost",
  port: 8000,
});

// 🤫 Industry-Grade SILENCE: Monkey-patch the client to stop "No embedding function" warnings
// We handle embeddings manually via Gemini, but Chroma warns if it doesn't see a registered function.
const originalGetOrCreate = chromaClient.getOrCreateCollection.bind(chromaClient);
chromaClient.getOrCreateCollection = async (args: any) => {
  return originalGetOrCreate({
    ...args,
    embeddingFunction: { generate: async (texts: string[]) => [] },
  });
};

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.CHATBOT_API_KEY!,
  model: "gemini-embedding-001",
  maxRetries: 0, // Fail fast in development
});

// 1️⃣ Initialize & insert documents only if the collection is empty
export async function initializeChroma() {
  try {
    const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    const count = await collection.count();
    if (count > 0) {
      console.log(`✅ Chroma: Collection '${COLLECTION_NAME}' already has ${count} docs. Skipping initialization.`);
      return getChromaStore();
    }
  } catch (e) {
    // Collection doesn't exist, proceed to create it
  }

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
    index: chromaClient, // 👈 Bypass 'url' to solve path deprecation
    collectionMetadata: { "hnsw:space": "cosine" },
  });

  console.log("✅ Chroma: New collection initialized & data stored");
  return vectorStore;
}

// 2️⃣ Later, just connect without re-embedding
export async function getChromaStore() {
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    index: chromaClient, // 👈 Bypass 'url' to solve path deprecation
  });
  return vectorStore;
}

