import express from 'express';
import { 
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponse,
    revealFeedbackIdentity,
    resolveFeedbackController
 } from '../controllers/feedbackControllers.js'
 import { createReport } from '../controllers/safetyReportController.js';
import authMiddleware  from '../middleware/authMiddleware.js';
import requireActiveAccount from '../middleware/requireActiveAccount.js';
import createRateLimiter from '../middleware/rateLimit.js';

const router = express.Router();

// create feedback
router.post(
    '/',
    authMiddleware,
    requireActiveAccount,
    createRateLimiter({
        limit: 5,
        windowSeconds: 60,
        keyPrefix: 'rate-limit:feedback',
    }),
    createFeedback
);

//get user's feedbacks
router.get('/:userId', authMiddleware, getFeedbackForUser);

// feedback visibility
router.patch('/:feedbackId/visibility', authMiddleware, updateFeedbackVisibility);

// Delete feedback
router.delete('/:feedbackId', authMiddleware, deleteFeedback);

// Respond to feedback
router.post('/:feedbackId/responses', authMiddleware, requireActiveAccount, createFeedbackResponse);

// Get Response by Id
router.get('/:feedbackId/responses', authMiddleware, getFeedbackResponse );

// Create report
router.post('/:feedbackId/reports', authMiddleware, createReport );

//Reveal feedback Identity
router.post('/:feedbackId/reveal-identity', authMiddleware, revealFeedbackIdentity);

router.post("/:feedbackId/resolve", authMiddleware, resolveFeedbackController);

export default router;