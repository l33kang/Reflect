import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from './routes/feedbackRoutes.js';
import friendRequestRoutes from './routes/friendRequestRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reputationRoutes, { reputationHistoryRouter } from "./routes/reputationRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import bestFriendRoutes from "./routes/bestFriendRoutes.js";
import hobbyRoutes from "./routes/hobbyRoutes.js";
import postRoutes from './routes/postRoutes.js';

const app = express();

const allowedFrontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        const isLocalDevelopmentOrigin =
            process.env.NODE_ENV !== "production" &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

        callback(
            null,
            !origin ||
            allowedFrontendOrigins.includes(origin) ||
            isLocalDevelopmentOrigin
        );
    }
}));

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", reputationRoutes);
app.use("/api/reputation", reputationHistoryRouter);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/friend-request", friendRequestRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/best-friends", bestFriendRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/hobbies", hobbyRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Reflect API is running"
    });
});


app.use(errorMiddleware);

export default app;
