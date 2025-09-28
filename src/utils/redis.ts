import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000); 
    },
  },
});

redisClient.on("connect", () => console.log(" Connected to Cloud Redis"));
redisClient.on("error", (err) => console.error(" Redis Error:", err));

(async () => {
  await redisClient.connect();
})();
