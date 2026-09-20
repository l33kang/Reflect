import express from 'express';
import { loginUser } from "../controllers/authControllers.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Login
router.post('/login', loginUser);


export default router;