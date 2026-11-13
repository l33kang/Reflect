import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/database.js";
import {
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponses,
    revealFeedbackIdentity
} from "../src/services/feedbackServices.js";


test("a user cannot change another user's feedback visibility", async () => {
    const attacker = await prisma.user.create({
        data: {
            email: `attacker-${Date.now()}@test.com`,
            username: `attacker-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const recipient = await prisma.user.create({
        data: {
            email: `recipient-${Date.now()}@test.com`,
            username: `recipient-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId: attacker.id,
            toUserId: recipient.id,
            content: "Test feedback",
            isAnonymous: true,
            allowIdentityReveal: false
        }
    });

    await assert.rejects(
        () =>
            updateFeedbackVisibility(
                feedback.id,
                attacker.id,
                "PUBLIC"
            ),
        {
            message: "Not authorized"
        }
    );

    await prisma.feedback.delete({
        where: { id: feedback.id }
    });

    await prisma.user.delete({
        where: { id: attacker.id }
    });

    await prisma.user.delete({
        where: { id: recipient.id }
    });
});

test("a user cannot delete another user's feedback", async () => {
    const attacker = await prisma.user.create({
        data: {
            email: `attacker-delete-${Date.now()}@test.com`,
            username: `attacker-delete-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const recipient = await prisma.user.create({
        data: {
            email: `recipient-delete-${Date.now()}@test.com`,
            username: `recipient-delete-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId: attacker.id,
            toUserId: recipient.id,
            content: "Test feedback",
            isAnonymous: true,
            allowIdentityReveal: false
        }
    });

    await assert.rejects(
        () =>
            deleteFeedback(
                feedback.id,
                attacker.id
            ),
        {
            message: "Not authorized"
        }
    );

    await prisma.feedback.delete({
        where: { id: feedback.id }
    });

    await prisma.user.delete({
        where: { id: attacker.id }
    });

    await prisma.user.delete({
        where: { id: recipient.id }
    });
});

test("a user cannot respond to another user's feedback", async () => {
    const attacker = await prisma.user.create({
        data: {
            email: `attacker-response-${Date.now()}@test.com`,
            username: `attacker-response-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const recipient = await prisma.user.create({
        data: {
            email: `recipient-response-${Date.now()}@test.com`,
            username: `recipient-response-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId: attacker.id,
            toUserId: recipient.id,
            content: "Test feedback",
            isAnonymous: true,
            allowIdentityReveal: false
        }
    });

    await assert.rejects(
        () =>
            createFeedbackResponse({
                feedbackId: feedback.id,
                responderId: attacker.id,
                responseType: "THANK_YOU",
                body: "Thanks!"
            }),
        {
            message: "Not authorized"
        }
    );

    await prisma.feedback.delete({
        where: { id: feedback.id }
    });

    await prisma.user.delete({
        where: { id: attacker.id }
    });

    await prisma.user.delete({
        where: { id: recipient.id }
    });
});

test("a user cannot view another user's feedback responses", async () => {
    const sender = await prisma.user.create({
        data: {
            email: `sender-responses-${Date.now()}@test.com`,
            username: `sender-responses-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const recipient = await prisma.user.create({
        data: {
            email: `recipient-responses-${Date.now()}@test.com`,
            username: `recipient-responses-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const outsider = await prisma.user.create({
        data: {
            email: `outsider-responses-${Date.now()}@test.com`,
            username: `outsider-responses-${Date.now()}`,
            passwordHash: "test-hash"
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId: sender.id,
            toUserId: recipient.id,
            content: "Test feedback",
            isAnonymous: true,
            allowIdentityReveal: false
        }
    });

    await assert.rejects(
        () =>
            getFeedbackResponses(
                feedback.id,
                outsider.id
            ),
        {
            message: "Not authorized!"
        }
    );

    await prisma.feedback.delete({
        where: { id: feedback.id }
    });

    await prisma.user.delete({
        where: { id: sender.id }
    });

    await prisma.user.delete({
        where: { id: recipient.id }
    });

    await prisma.user.delete({
        where: { id: outsider.id }
    });
});

test("a user cannot reveal the identity of another user's feedback sender", async () => {
    const sender = await prisma.user.create({
        data: {
            email: `sender-reveal-${Date.now()}@test.com`,
            username: `sender-reveal-${Date.now()}@test.com`,
            passwordHash: "test-hash"
        }
    });

    const recipient = await prisma.user.create({
        data: {
            email: `recipient-reveal-${Date.now()}@test.com`,
            username: `recipient-reveal-${Date.now()}@test.com`,
            passwordHash: "test-hash"
        }
    });

    const outsider = await prisma.user.create({
        data: {
            email: `outsider-reveal-${Date.now()}@test.com`,
            username: `outsider-reveal-${Date.now()}@test.com`,
            passwordHash: "test-hash"
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            fromUserId: sender.id,
            toUserId: recipient.id,
            content: "Anonymous test feedback",
            isAnonymous: true,
            allowIdentityReveal: true
        }
    });

    await assert.rejects(
        () =>
            revealFeedbackIdentity(
                feedback.id,
                outsider.id
            ),
        {
            message: "Not authorized"
        }
    );

    await prisma.feedback.delete({
        where: { id: feedback.id }
    });

    await prisma.user.delete({
        where: { id: sender.id }
    });

    await prisma.user.delete({
        where: { id: recipient.id }
    });

    await prisma.user.delete({
        where: { id: outsider.id }
    });
});