import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {getUserReputation} from '../controllers/reputationControllers.js';

const router = express.Router();

router.get('/:username/reputation', authMiddleware, getUserReputation);

export default router;