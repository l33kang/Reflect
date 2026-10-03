import express from 'express';
import { sendFriendRequest, acceptFriendRequest } from '../controllers/friendRequestController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, sendFriendRequest);

router.patch('/:requestId/accept', authMiddleware, acceptFriendRequest);

export default router;