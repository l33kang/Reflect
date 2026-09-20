import express from 'express';
import { createFeedback, getFeedbackForUser } from '../controllers/feedbackControllers.js'
import authMiddleware  from '../middleware/authMiddleware.js';

const router = express.Router();

// create feedback
router.post('/', authMiddleware, createFeedback);

//get user's feedbacks
router.get('/:userId', authMiddleware, getFeedbackForUser);

export default router;