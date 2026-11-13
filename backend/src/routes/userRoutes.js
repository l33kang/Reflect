import express from "express";
import {createUser, getUsers, getUserById, updateUserProfile, getMe} from '../controllers/userControllers.js';
import { updatePrivacySettings } from "../controllers/privacyControllers.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

//Get all users
router.get("/", getUsers);

//Get a user by ID
router.get("/me", authMiddleware, getMe);
router.get("/:id", getUserById);

router.patch("/me/privacy", authMiddleware, updatePrivacySettings);

//Create a new user
router.post("/", createUser);

//Update a user's profile by ID
router.put("/:id/profile", authMiddleware, updateUserProfile);

export default router;