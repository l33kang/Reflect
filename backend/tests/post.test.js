import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/database.js";
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
} from "../src/services/postServices.js";

const createUser = async (suffix) => {
    return await prisma.user.create({
        data: {
            email: `feed-${suffix}-${Date.now()}@test.com`,
            username: `feeduser-${suffix}-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });
};

const cleanup = async (...users) => {
    for (const user of users) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    }
};

test("a user can create a post", async () => {
    const author = await createUser("author");
    try {
        const post = await createPost({ authorId: author.id, content: "Hello Reflect!" });

        assert.strictEqual(post.content, "Hello Reflect!");
        assert.strictEqual(post.authorId, author.id);
        assert.ok(post.id);
        assert.ok(post.createdAt);
        assert.ok(post.updatedAt);
    } finally {
        await cleanup(author);
    }
});

test("creating a post without content throws", async () => {
    const author = await createUser("nocontent");
    try {
        await assert.rejects(
            () => createPost({ authorId: author.id, content: "" }),
            { message: "Post content is required" }
        );
    } finally {
        await cleanup(author);
    }
});

test("feed returns posts from friends, recent first", async () => {
    const viewer = await createUser("viewer");
    const friend = await createUser("friend");
    const stranger = await createUser("stranger");

    try {
        await prisma.friendship.create({
            data: { userAId: viewer.id, userBId: friend.id }
        });

        const older = await createPost({ authorId: friend.id, content: "older post" });
        // small delay so createdAt differs meaningfully
        await new Promise(r => setTimeout(r, 20));
        const newer = await createPost({ authorId: friend.id, content: "newer post" });
        await createPost({ authorId: stranger.id, content: "stranger post" });

        const result = await getFeed(viewer.id, { limit: 10 });

        assert.strictEqual(result.posts.length, 2);
        assert.strictEqual(result.posts[0].id, newer.id);
        assert.strictEqual(result.posts[1].id, older.id);
        assert.strictEqual(result.posts[0].author.id, friend.id);
        assert.strictEqual(result.nextCursor, null);
    } finally {
        await cleanup(viewer, friend, stranger);
    }
});

test("feed is paginated with a cursor", async () => {
    const viewer = await createUser("pager");
    const friend = await createUser("pager-friend");

    try {
        await prisma.friendship.create({
            data: { userAId: viewer.id, userBId: friend.id }
        });

        const created = [];
        for (let i = 0; i < 25; i++) {
            created.push(await createPost({ authorId: friend.id, content: `post ${i}` }));
        }

        const first = await getFeed(viewer.id, { limit: 10 });
        assert.strictEqual(first.posts.length, 10);
        assert.ok(first.nextCursor);
        assert.ok(first.posts.every(p => p.author.id === friend.id));

        const second = await getFeed(viewer.id, { cursor: first.nextCursor, limit: 10 });
        assert.strictEqual(second.posts.length, 10);
        assert.ok(second.nextCursor);

        const third = await getFeed(viewer.id, { cursor: second.nextCursor, limit: 10 });
        assert.strictEqual(third.posts.length, 5);
        assert.strictEqual(third.nextCursor, null);

        const allIds = new Set([...first.posts, ...second.posts, ...third.posts].map(p => p.id));
        assert.strictEqual(allIds.size, 25);
    } finally {
        await cleanup(viewer, friend);
    }
});

test("feed is empty when the user has no friends", async () => {
    const viewer = await createUser("lonely");
    const other = await createUser("lonely-other");

    try {
        await createPost({ authorId: other.id, content: "unrelated post" });

        const result = await getFeed(viewer.id, { limit: 10 });
        assert.strictEqual(result.posts.length, 0);
        assert.strictEqual(result.nextCursor, null);
    } finally {
        await cleanup(viewer, other);
    }
});

test("a user can get a single post with counts", async () => {
    const author = await createUser("postowner");
    const viewer = await createUser("postviewer");

    try {
        const post = await createPost({ authorId: author.id, content: "A single post" });
        await createComment({ postId: post.id, authorId: author.id, content: "nice!" });

        const fetched = await getPost(post.id, viewer.id);

        assert.strictEqual(fetched.id, post.id);
        assert.strictEqual(fetched.content, "A single post");
        assert.strictEqual(fetched.commentCount, 1);
        assert.strictEqual(fetched.reactionCount, 0);
        assert.strictEqual(fetched.myReaction, null);
    } finally {
        await cleanup(author, viewer);
    }
});

test("a user can update their own post", async () => {
    const author = await createUser("updater");
    try {
        const post = await createPost({ authorId: author.id, content: "original" });

        const updated = await updatePost(post.id, author.id, "updated content");

        assert.strictEqual(updated.content, "updated content");
        assert.ok(new Date(updated.updatedAt) >= new Date(updated.createdAt));
    } finally {
        await cleanup(author);
    }
});

test("a user cannot update another user's post", async () => {
    const author = await createUser("owner");
    const attacker = await createUser("attacker");

    try {
        const post = await createPost({ authorId: author.id, content: "original" });

        await assert.rejects(
            () => updatePost(post.id, attacker.id, "hacked"),
            { message: "Not authorized" }
        );

        const stillOriginal = await prisma.post.findUnique({ where: { id: post.id } });
        assert.strictEqual(stillOriginal.content, "original");
    } finally {
        await cleanup(author, attacker);
    }
});

test("a user can delete their own post", async () => {
    const author = await createUser("deleter");
    try {
        const post = await createPost({ authorId: author.id, content: "to be deleted" });

        await deletePost(post.id, author.id);

        const missing = await prisma.post.findUnique({ where: { id: post.id } });
        assert.strictEqual(missing, null);
    } finally {
        await cleanup(author);
    }
});

test("a user cannot delete another user's post", async () => {
    const author = await createUser("owner2");
    const attacker = await createUser("attacker2");

    try {
        const post = await createPost({ authorId: author.id, content: "original" });

        await assert.rejects(
            () => deletePost(post.id, attacker.id),
            { message: "Not authorized" }
        );

        const stillThere = await prisma.post.findUnique({ where: { id: post.id } });
        assert.strictEqual(stillThere !== null, true);
    } finally {
        await cleanup(author, attacker);
    }
});

test("a user can react to a post and gets one reaction per post", async () => {
    const author = await createUser("react-author");
    const reactor = await createUser("reactor");

    try {
        const post = await createPost({ authorId: author.id, content: "reactable" });

        const first = await createReaction(post.id, reactor.id, "LOVE");
        assert.strictEqual(first.reaction.type, "LOVE");
        assert.strictEqual(first.isNew, true);

        // reacting again with a different type updates the existing reaction (still one per user)
        const second = await createReaction(post.id, reactor.id, "LIKE");
        assert.strictEqual(second.reaction.type, "LIKE");
        assert.strictEqual(second.isNew, false);

        const reactions = await prisma.postReaction.findMany({ where: { postId: post.id, userId: reactor.id } });
        assert.strictEqual(reactions.length, 1);
    } finally {
        await cleanup(author, reactor);
    }
});

test("reacting with an invalid type throws", async () => {
    const author = await createUser("react-author2");
    const reactor = await createUser("reactor2");

    try {
        const post = await createPost({ authorId: author.id, content: "reactable" });

        await assert.rejects(
            () => createReaction(post.id, reactor.id, "INVALID"),
            { message: "Invalid reaction type" }
        );
    } finally {
        await cleanup(author, reactor);
    }
});

test("a user can remove their reaction", async () => {
    const author = await createUser("react-author3");
    const reactor = await createUser("reactor3");

    try {
        const post = await createPost({ authorId: author.id, content: "reactable" });
        await createReaction(post.id, reactor.id, "LIKE");

        await removeReaction(post.id, reactor.id);

        const remaining = await prisma.postReaction.findMany({ where: { postId: post.id, userId: reactor.id } });
        assert.strictEqual(remaining.length, 0);

        await assert.rejects(
            () => removeReaction(post.id, reactor.id),
            { message: "Reaction not found" }
        );
    } finally {
        await cleanup(author, reactor);
    }
});

test("a user can comment on a post", async () => {
    const author = await createUser("comment-author");
    const commenter = await createUser("commenter");

    try {
        const post = await createPost({ authorId: author.id, content: "commentable" });

        const comment = await createComment({ postId: post.id, authorId: commenter.id, content: "Great post!" });

        assert.strictEqual(comment.content, "Great post!");
        assert.strictEqual(comment.postId, post.id);
        assert.strictEqual(comment.authorId, commenter.id);
        assert.ok(comment.createdAt);
    } finally {
        await cleanup(author, commenter);
    }
});

test("comment pagination returns newest-first order", async () => {
    const author = await createUser("cauthor");
    const commenter = await createUser("ccommenter");

    try {
        const post = await createPost({ authorId: author.id, content: "commentable" });

        await new Promise(r => setTimeout(r, 20));
        const c1 = await createComment({ postId: post.id, authorId: commenter.id, content: "first" });
        await new Promise(r => setTimeout(r, 20));
        const c2 = await createComment({ postId: post.id, authorId: commenter.id, content: "second" });

        const result = await getComments(post.id, { limit: 10 });
        assert.strictEqual(result.comments.length, 2);
        // comments are returned oldest-first (conversation order)
        assert.strictEqual(result.comments[0].id, c1.id);
        assert.strictEqual(result.comments[1].id, c2.id);
    } finally {
        await cleanup(author, commenter);
    }
});

test("a user can update and delete their own comment", async () => {
    const author = await createUser("cauthor2");
    const commenter = await createUser("ccommenter2");

    try {
        const post = await createPost({ authorId: author.id, content: "commentable" });
        const comment = await createComment({ postId: post.id, authorId: commenter.id, content: "original" });

        const updated = await updateComment(comment.id, commenter.id, "edited");
        assert.strictEqual(updated.content, "edited");

        await deleteComment(comment.id, commenter.id);
        const missing = await prisma.comment.findUnique({ where: { id: comment.id } });
        assert.strictEqual(missing, null);
    } finally {
        await cleanup(author, commenter);
    }
});

test("a user cannot update or delete another user's comment", async () => {
    const author = await createUser("cauthor3");
    const commenter = await createUser("ccommenter3");
    const attacker = await createUser("cattacker");

    try {
        const post = await createPost({ authorId: author.id, content: "commentable" });
        const comment = await createComment({ postId: post.id, authorId: commenter.id, content: "original" });

        await assert.rejects(
            () => updateComment(comment.id, attacker.id, "hacked"),
            { message: "Not authorized" }
        );
        await assert.rejects(
            () => deleteComment(comment.id, attacker.id),
            { message: "Not authorized" }
        );

        const stillThere = await prisma.comment.findUnique({ where: { id: comment.id } });
        assert.strictEqual(stillThere.content, "original");
    } finally {
        await cleanup(author, commenter, attacker);
    }
});

test("reacting to your own post creates a notification for the author", async () => {
    const author = await createUser("notif-author");
    const reactor = await createUser("notif-reactor");

    try {
        const post = await createPost({ authorId: author.id, content: "notifiable" });

        await createReaction(post.id, reactor.id, "LIKE");

        const notifications = await prisma.notification.findMany({
            where: { userId: author.id, type: "POST_REACTION" }
        });
        assert.strictEqual(notifications.length, 1);
        assert.ok(notifications[0].message.includes("reacted like"));
    } finally {
        await cleanup(author, reactor);
    }
});

test("commenting on your own post creates a notification for the author", async () => {
    const author = await createUser("cnotif-author");
    const commenter = await createUser("cnotif-commenter");

    try {
        const post = await createPost({ authorId: author.id, content: "c-notifiable" });

        await createComment({ postId: post.id, authorId: commenter.id, content: "wow" });

        const notifications = await prisma.notification.findMany({
            where: { userId: author.id, type: "POST_COMMENT" }
        });
        assert.strictEqual(notifications.length, 1);
    } finally {
        await cleanup(author, commenter);
    }
});

test("interacting with your own post does not create a notification", async () => {
    const author = await createUser("selfnotif");

    try {
        const post = await createPost({ authorId: author.id, content: "self-notifiable" });

        await createReaction(post.id, author.id, "LOVE");
        await createComment({ postId: post.id, authorId: author.id, content: "self comment" });

        const notifications = await prisma.notification.findMany({
            where: { userId: author.id }
        });
        assert.strictEqual(notifications.length, 0);
    } finally {
        await cleanup(author);
    }
});
