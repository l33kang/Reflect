
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    block,
    unblock,
    listBlockedUsers,
} from "../controllers/blockControllers.js";

const router = express.Router();

router.post("/:userId", authMiddleware, block);
router.delete("/:userId", authMiddleware, unblock);
router.get("/", authMiddleware, listBlockedUsers);

export default router;
