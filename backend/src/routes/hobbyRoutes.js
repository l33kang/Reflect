import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createHobby,
    deleteHobby,
    listUserHobbies
} from "../controllers/hobbyControllers.js";

const router = express.Router();

router.post("/", authMiddleware, createHobby);
router.delete("/:hobbyId", authMiddleware, deleteHobby);
router.get("/:userId", authMiddleware, listUserHobbies);

export default router;