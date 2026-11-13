import prisma from '../config/database.js';
import { createNotification } from './notificationServices.js';

const VALID_REACTION_TYPES = new Set(['LIKE', 'LOVE', 'LAUGH', 'SAD', 'ANGRY']);
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const normalizeLimit = (limit) => {
    const parsed = limit ? parseInt(limit, 10) : DEFAULT_LIMIT;
    if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
    return Math.min(parsed, MAX_LIMIT);
};

const createPost = async ({ authorId, content }) => {
    if (!content || content.trim().length === 0) {
        throw new Error("Post content is required");
    }

    const post = await prisma.post.create({
        data: {
            authorId,
            content: content.trim()
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    return post;
};

const getFeed = async (userId, { cursor, limit } = {}) => {
    const take = normalizeLimit(limit);

    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { userAId: userId },
                { userBId: userId }
            ]
        },
        select: {
            userAId: true,
            userBId: true
        }
    });

    const friendIds = friendships.map(f =>
        f.userAId === userId ? f.userBId : f.userAId
    );

    if (friendIds.length === 0) {
        return { posts: [], nextCursor: null };
    }

    // Do not surface posts from users involved in a block (either direction).
    const blocks = await prisma.block.findMany({
        where: {
            OR: [
                { blockerId: userId },
                { blockedId: userId }
            ]
        },
        select: {
            blockerId: true,
            blockedId: true
        }
    });

    const blockedIds = blocks.map(b =>
        b.blockerId === userId ? b.blockedId : b.blockerId
    );

    const where = {
        authorId: {
            in: friendIds,
            ...(blockedIds.length > 0 ? { notIn: blockedIds } : {})
        }
    };

    const posts = await prisma.post.findMany({
        where,
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            },
            reactions: {
                select: {
                    id: true,
                    type: true,
                    userId: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        },
        orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' }
        ],
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    const hasMore = posts.length > take;
    const page = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

    return {
        posts: page.map(post => {
            const myReaction = post.reactions.find(r => r.userId === userId);
            return {
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                author: post.author,
                reactionCount: post.reactions.length,
                commentCount: post._count.comments,
                myReaction: myReaction ? myReaction.type : null
            };
        }),
        nextCursor
    };
};

const getPost = async (postId, viewerId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            },
            reactions: {
                select: {
                    id: true,
                    type: true,
                    userId: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    if (!post) {
        throw new Error("Post not found");
    }

    const myReaction = post.reactions.find(r => r.userId === viewerId);

    return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        reactionCount: post.reactions.length,
        commentCount: post._count.comments,
        myReaction: myReaction ? myReaction.type : null
    };
};

const updatePost = async (postId, userId, content) => {
    if (!content || content.trim().length === 0) {
        throw new Error("Post content is required");
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new Error("Post not found");
    }

    if (post.authorId !== userId) {
        throw new Error("Not authorized");
    }

    return await prisma.post.update({
        where: { id: postId },
        data: { content: content.trim() },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });
};

const deletePost = async (postId, userId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new Error("Post not found");
    }

    if (post.authorId !== userId) {
        throw new Error("Not authorized");
    }

    return await prisma.post.delete({
        where: { id: postId }
    });
};

const createReaction = async (postId, userId, type) => {
    if (!VALID_REACTION_TYPES.has(type)) {
        throw new Error("Invalid reaction type");
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new Error("Post not found");
    }

    const existing = await prisma.postReaction.findFirst({
        where: { postId, userId },
        select: { id: true, type: true }
    });

    let reaction;
    let isNew = false;

    if (existing) {
        if (existing.type !== type) {
            reaction = await prisma.postReaction.update({
                where: { id: existing.id },
                data: { type }
            });
        } else {
            reaction = existing;
        }
    } else {
        reaction = await prisma.postReaction.create({
            data: { postId, userId, type },
            select: { id: true, type: true, userId: true, createdAt: true }
        });
        isNew = true;
    }

    // Notify the post author when someone reacts (never notify on your own post).
    if (isNew && post.authorId !== userId) {
        try {
            const actor = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true }
            });
            await createNotification({
                userId: post.authorId,
                type: 'POST_REACTION',
                message: `${actor?.username || 'Someone'} reacted ${type.toLowerCase()} to your post`
            });
        } catch (err) {
            // Notifications are a best-effort side effect and must not fail the reaction.
            console.error('Failed to create post reaction notification:', err.message);
        }
    }

    return { reaction, isNew };
};

const removeReaction = async (postId, userId) => {
    const reaction = await prisma.postReaction.findFirst({
        where: { postId, userId },
        select: { id: true }
    });

    if (!reaction) {
        throw new Error("Reaction not found");
    }

    return await prisma.postReaction.delete({
        where: { id: reaction.id }
    });
};

const createComment = async ({ postId, authorId, content }) => {
    if (!content || content.trim().length === 0) {
        throw new Error("Comment content is required");
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new Error("Post not found");
    }

    const comment = await prisma.comment.create({
        data: {
            postId,
            authorId,
            content: content.trim()
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    // Notify the post author when someone comments (never notify on your own post).
    if (post.authorId !== authorId) {
        try {
            const actor = await prisma.user.findUnique({
                where: { id: authorId },
                select: { username: true }
            });
            await createNotification({
                userId: post.authorId,
                type: 'POST_COMMENT',
                message: `${actor?.username || 'Someone'} commented on your post`
            });
        } catch (err) {
            console.error('Failed to create post comment notification:', err.message);
        }
    }

    return comment;
};

const getComments = async (postId, { cursor, limit } = {}) => {
    const take = normalizeLimit(limit);

    const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        },
        orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
        ],
        take: take + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    const hasMore = comments.length > take;
    const page = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

    return {
        comments: page.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.author
        })),
        nextCursor
    };
};

const updateComment = async (commentId, userId, content) => {
    if (!content || content.trim().length === 0) {
        throw new Error("Comment content is required");
    }

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true }
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    if (comment.authorId !== userId) {
        throw new Error("Not authorized");
    }

    return await prisma.comment.update({
        where: { id: commentId },
        data: { content: content.trim() },
        include: {
            author: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });
};

const deleteComment = async (commentId, userId) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true }
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    if (comment.authorId !== userId) {
        throw new Error("Not authorized");
    }

    return await prisma.comment.delete({
        where: { id: commentId }
    });
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
