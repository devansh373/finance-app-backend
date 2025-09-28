"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`Redis reconnect attempt #${retries}`);
            return Math.min(retries * 100, 3000);
        },
    },
});
exports.redisClient.on("connect", () => console.log(" Connected to Cloud Redis"));
exports.redisClient.on("error", (err) => console.error(" Redis Error:", err));
(async () => {
    await exports.redisClient.connect();
})();
