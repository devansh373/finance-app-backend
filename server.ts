import mongoose from "mongoose";
import app from "./src/app";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected successfully");


    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });
