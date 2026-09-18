import express from "express";
import {createUser, getUsers, getUserById, updateUserProfile} from '../controllers/userControllers.js';

const router = express.Router();

//Get all users
router.get("/", getUsers);

//Get a user by ID
router.get("/:id", getUserById);

//Create a new user
router.post("/", createUser);

//Update a user's profile by ID
router.put("/:id/profile", updateUserProfile);

export default router;