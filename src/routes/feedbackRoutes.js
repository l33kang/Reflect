import express from 'express';
import { 
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponse
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

// Respond to feedback
router.post('/:feedbackId/responses', authMiddleware, createFeedbackResponse);

// Get Response by Id
router.get('/:feedbackId/responses', authMiddleware, getFeedbackResponse );

export default router;