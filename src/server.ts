// import mongoose from "mongoose";
// import app from "./app";
// import { initializeChroma } from "./ragSetup";

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI!;


// mongoose
//   .connect(MONGO_URI)
//   .then(async() => {
//     console.log(" MongoDB connected successfully");

//      await initializeChroma();

//     app.listen(PORT, () => {
//       console.log(` Server running on port ${PORT}`);
//     });
    
//   })
//   .catch((err) => {
//     console.error(" MongoDB connection error:", err);
//     process.exit(1);
//   });

import mongoose from "mongoose";
import app from "./app";
import { initializeChroma } from "./ragSetup";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

async function startServer() {
  try {
    console.log("🟢 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    console.log("🟣 Initializing Chroma...");
    await initializeChroma(); // run only once

    app.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();

