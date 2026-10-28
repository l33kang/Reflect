import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from './routes/feedbackRoutes.js';
import friendRequestRoutes from './routes/friendRequestRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reputationRoutes from "./routes/reputationRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", reputationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/friend-request", friendRequestRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/block", blockRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Reflect API is running"
    });
});


app.use(errorMiddleware);

export default app;

