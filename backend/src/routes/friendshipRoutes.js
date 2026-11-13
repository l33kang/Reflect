import express from 'express';
import {
    getFriends,
    getFriendsById,
    unfriend
} from '../controllers/friendshipControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getFriends);
router.get('/:userId', authMiddleware, getFriendsById);
router.delete('/:friendId', authMiddleware, unfriend);

export default router;