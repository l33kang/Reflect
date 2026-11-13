import express from 'express';
import { loginUser } from "../controllers/authControllers.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
 

export default router;