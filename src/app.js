import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Reflect API is running"
    });
});


app.use(errorMiddleware);

export default app;

