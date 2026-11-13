import express from "express";
import { getPendingReports, updateReportStatus, getReportHistory, hideReportedFeedback } from "../controllers/moderationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireModerator from "../middleware/requireModerator.js";
import {
    submitAppeal,
    resolveAppealController
} from "../controllers/moderationAppealController.js";
import {
    createAction,
    getCase,
    getCases,
    getCaseHistory
} from "../controllers/moderationCaseController.js";

const router = express.Router();

router.get("/pending", authMiddleware, requireModerator, getPendingReports);

router.patch("/reports/:reportId/status", authMiddleware, requireModerator, updateReportStatus);

router.get("/reports/:reportId/history", authMiddleware, requireModerator, getReportHistory);

router.patch("/reports/:reportId/hide-feedback", authMiddleware, requireModerator, hideReportedFeedback);

router.post("/cases/:caseId/appeals", authMiddleware, submitAppeal);

router.patch("/appeals/:appealId", authMiddleware, requireModerator, resolveAppealController);

router.post("/cases/:caseId/actions", authMiddleware, requireModerator, createAction);

router.get("/cases/:caseId", authMiddleware, requireModerator, getCase);

router.get("/cases", authMiddleware, requireModerator, getCases);

router.get("/cases/:caseId/history", authMiddleware, requireModerator, getCaseHistory);

export default router;