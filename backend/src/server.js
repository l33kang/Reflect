
import app from "./app.js";
import redisClient from "./config/redis.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await redisClient.connect();

        console.log("Redis connected successfully");

        app.listen(PORT, () => {
            console.log(`Reflect API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
