import express from 'express';
import { 
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback
 } from '../controllers/feedbackControllers.js'
import authMiddleware  from '../middleware/authMiddleware.js';

const router = express.Router();

// create feedback
router.post('/', authMiddleware, createFeedback);

//get user's feedbacks
router.get('/:userId', authMiddleware, getFeedbackForUser);

// feedback visibility
router.patch('/:feedbackId/visibility', authMiddleware, updateFeedbackVisibility);

// Delete feedback
router.delete('/:feedbackId', authMiddleware, deleteFeedback);

export default router;