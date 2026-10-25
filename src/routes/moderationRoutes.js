import express from "express";
import { getPendingReports, updateReportStatus, getReportHistory, hideReportedFeedback } from "../controllers/moderationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireModerator from "../middleware/requireModerator.js";

const router = express.Router();

router.get("/pending", authMiddleware, requireModerator, getPendingReports);

router.patch("/reports/:reportId/status", authMiddleware, requireModerator, updateReportStatus);

router.get("/reports/:reportId/history", authMiddleware, requireModerator, getReportHistory);

router.patch("/reports/:reportId/hide-feedback", authMiddleware, requireModerator, hideReportedFeedback);

export default router;