import express from 'express';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    incomingFriendRequests,
    outgoingFriendRequests
} from '../controllers/friendRequestController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import createRateLimiter from '../middleware/rateLimit.js';

const router = express.Router();


router.post(
    '/',
    authMiddleware,
    createRateLimiter({
        limit: 5,
        windowSeconds: 60,
        keyPrefix: 'rate-limit:friend-request',
    }),
    sendFriendRequest
);
router.patch('/:requestId/accept', authMiddleware, acceptFriendRequest);
router.patch('/:requestId/reject', authMiddleware, rejectFriendRequest);
router.delete('/:requestId/cancel', authMiddleware, cancelFriendRequest);
router.get('/incoming', authMiddleware, incomingFriendRequests);
router.get('/outgoing', authMiddleware, outgoingFriendRequests);

export default router;