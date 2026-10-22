import express from "express";
import { getPendingReports } from "../controllers/moderationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireModerator from "../middleware/requireModerator.js";

const router = express.Router();

router.get("/pending", authMiddleware, requireModerator, getPendingReports);

export default router;