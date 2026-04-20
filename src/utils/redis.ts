import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 4) {
        console.error(
          "❌ Redis reconnection failed after 4 attempts. Stopping.",
        );
        return false; // Stop reconnecting
      }
      console.log(`Redis reconnect attempt #${retries}`);
      return Math.min(retries * 500, 3000);
    },
  },
});

redisClient.on("connect", () => console.log(" Connected to Cloud Redis"));
redisClient.on("error", (err) => console.error(" Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
  } catch (err: any) {
    console.error("❌ Initial Redis connection failed:", err.message);
  }
})();
