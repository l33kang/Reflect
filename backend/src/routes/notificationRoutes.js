import express from "express";
import { getNotifications, updateNotification } from "../controllers/notificationControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/:notificationId/read', authMiddleware, updateNotification);

export default router;