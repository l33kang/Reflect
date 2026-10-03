import express from 'express';
import {
    getFriends,
    unfriend
} from '../controllers/friendshipControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getFriends);
router.delete('/:friendId', authMiddleware, unfriend);

export default router;