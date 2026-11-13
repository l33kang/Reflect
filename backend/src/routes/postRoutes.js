import express from 'express';
import {
    createPost,
    getFeed,
    getPost,
    updatePost,
    deletePost,
    createReaction,
    removeReaction,
    createComment,
    getComments,
    updateComment,
    deleteComment
} from '../controllers/postControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Posts
router.post('/', authMiddleware, createPost);
router.get('/feed', authMiddleware, getFeed);
router.get('/:postId', authMiddleware, getPost);
router.patch('/:postId', authMiddleware, updatePost);
router.delete('/:postId', authMiddleware, deletePost);

// Reactions (one reaction per user per post)
router.post('/:postId/reactions', authMiddleware, createReaction);
router.delete('/:postId/reactions', authMiddleware, removeReaction);

// Comments
router.post('/:postId/comments', authMiddleware, createComment);
router.get('/:postId/comments', authMiddleware, getComments);
router.patch('/comments/:commentId', authMiddleware, updateComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

export default router;
