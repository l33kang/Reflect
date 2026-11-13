import {
    createPost as createPostService,
    getFeed as getFeedService,
    getPost as getPostService,
    updatePost as updatePostService,
    deletePost as deletePostService,
    createReaction as createReactionService,
    removeReaction as removeReactionService,
    createComment as createCommentService,
    getComments as getCommentsService,
    updateComment as updateCommentService,
    deleteComment as deleteCommentService
} from '../services/postServices.js';

const createPost = async (req, res) => {
    const userId = req.user.userId;
    const { content } = req.body;

    try {
        const post = await createPostService({ authorId: userId, content });
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const getFeed = async (req, res) => {
    const userId = req.user.userId;
    const { cursor, limit } = req.query;

    try {
        const result = await getFeedService(userId, { cursor, limit });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: "Could not fetch feed" });
    }
};

const getPost = async (req, res) => {
    const viewerId = req.user.userId;
    const { postId } = req.params;

    try {
        const post = await getPostService(postId, viewerId);
        return res.status(200).json(post);
    } catch (err) {
        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(500).json({ error: "Could not fetch post" });
    }
};

const updatePost = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;

    try {
        const post = await updatePostService(postId, userId, content);
        return res.status(200).json(post);
    } catch (err) {
        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }
        if (err.message === "Not authorized") {
            return res.status(403).json({ error: "Not authorized" });
        }
        return res.status(400).json({ error: err.message });
    }
};

const deletePost = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    try {
        await deletePostService(postId, userId);
        return res.status(200).json({ message: "Post deleted" });
    } catch (err) {
        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }
        if (err.message === "Not authorized") {
            return res.status(403).json({ error: "Not authorized" });
        }
        return res.status(500).json({ error: "Could not delete post" });
    }
};

const createReaction = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { type } = req.body;

    try {
        const result = await createReactionService(postId, userId, type);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }
        if (err.message === "Invalid reaction type") {
            return res.status(400).json({ error: "Invalid reaction type" });
        }
        return res.status(500).json({ error: "Could not react to post" });
    }
};

const removeReaction = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    try {
        await removeReactionService(postId, userId);
        return res.status(200).json({ message: "Reaction removed" });
    } catch (err) {
        if (err.message === "Reaction not found") {
            return res.status(404).json({ error: "Reaction not found" });
        }
        return res.status(500).json({ error: "Could not remove reaction" });
    }
};

const createComment = async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content } = req.body;

    try {
        const comment = await createCommentService({ postId, authorId: userId, content });
        return res.status(201).json(comment);
    } catch (err) {
        if (err.message === "Post not found") {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(400).json({ error: err.message });
    }
};

const getComments = async (req, res) => {
    const { postId } = req.params;
    const { cursor, limit } = req.query;

    try {
        const result = await getCommentsService(postId, { cursor, limit });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: "Could not fetch comments" });
    }
};

const updateComment = async (req, res) => {
    const userId = req.user.userId;
    const { commentId } = req.params;
    const { content } = req.body;

    try {
        const comment = await updateCommentService(commentId, userId, content);
        return res.status(200).json(comment);
    } catch (err) {
        if (err.message === "Comment not found") {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (err.message === "Not authorized") {
            return res.status(403).json({ error: "Not authorized" });
        }
        return res.status(400).json({ error: err.message });
    }
};

const deleteComment = async (req, res) => {
    const userId = req.user.userId;
    const { commentId } = req.params;

    try {
        await deleteCommentService(commentId, userId);
        return res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        if (err.message === "Comment not found") {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (err.message === "Not authorized") {
            return res.status(403).json({ error: "Not authorized" });
        }
        return res.status(500).json({ error: "Could not delete comment" });
    }
};

export {
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
};
