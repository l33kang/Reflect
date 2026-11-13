
import redisClient from "../config/redis.js";

const createRateLimiter = ({ limit, windowSeconds, keyPrefix }) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    message: "Authentication required",
                });
            }

            const key = `${keyPrefix}:${userId}`;

            const count = await redisClient.eval(
                `local count = redis.call('INCR', KEYS[1])
                if count == 1 then
                    redis.call('EXPIRE', KEYS[1], ARGV[1])
                end
                return count`,
                {
                    keys: [key],
                    arguments: [String(windowSeconds)],
                }
            );

            res.set("RateLimit-Limit", String(limit));
            res.set("RateLimit-Remaining", String(Math.max(0, limit - count)));

            if (count > limit) {
                return res.status(429).json({
                    message: "Too many requests. Please try again later.",
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error.message);

            // Fail closed: don't allow the protected action if Redis fails.
            return res.status(503).json({
                message: "Request protection is temporarily unavailable.",
            });
        }
    };
};

export default createRateLimiter;
