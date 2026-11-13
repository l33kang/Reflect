import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createBestFriend,
    deleteBestFriend,
    listBestFriends
} from "../controllers/bestFriendControllers.js";

const router = express.Router();

router.post("/:friendId", authMiddleware, createBestFriend);
router.delete("/:friendId", authMiddleware, deleteBestFriend);
router.get("/:userId", authMiddleware, listBestFriends);

export default router;