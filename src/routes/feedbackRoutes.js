import express from 'express';
import { 
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponse,
    revealFeedbackIdentity
 } from '../controllers/feedbackControllers.js'
 import { createReport } from '../controllers/safetyReportController.js';
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

// Create report
router.post('/:feedbackId/reports', authMiddleware, createReport );

//Reveal feedback Identity
router.post('/:feedbackId/reveal-identity', authMiddleware, revealFeedbackIdentity);

export default router;