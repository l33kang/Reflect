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

const router = express.Router();

router.post('/', authMiddleware, sendFriendRequest);
router.patch('/:requestId/accept', authMiddleware, acceptFriendRequest);
router.patch('/:requestId/reject', authMiddleware, rejectFriendRequest);
router.delete('/:requestId/cancel', authMiddleware, cancelFriendRequest);
router.get('/incoming', authMiddleware, incomingFriendRequests);
router.get('/outgoing', authMiddleware, outgoingFriendRequests);

export default router;