import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

test(
    "moderation enforces report transitions and records an audit action for each change",
    { skip: !process.env.DATABASE_URL && "DATABASE_URL is required for integration tests" },
    async () => {
        process.env.JWT_SECRET = "safety-report-integration-test-secret";

        const [{ default: app }, { default: prisma }, { default: jwt }, services] =
            await Promise.all([
                import("../src/app.js"),
                import("../src/config/database.js"),
                import("jsonwebtoken"),
                import("../src/services/safetyReportServices.js")
            ]);

        const createdUserIds = [];
        const createdFeedbackIds = [];
        const createdReportIds = [];
        let server;

        try {
            const makeUser = async (role = "USER") => {
                const id = randomUUID();
                const user = await prisma.user.create({
                    data: {
                        id,
                        email: `${id}@safety-report-test.invalid`,
                        username: `test-${id}`,
                        passwordHash: "integration-test",
                        role
                    }
                });
                createdUserIds.push(user.id);
                return user;
            };

            const author = await makeUser();
            const reporter = await makeUser();
            const moderator = await makeUser("MODERATOR");

            const makeReport = async (suffix) => {
                const feedback = await prisma.feedback.create({
                    data: {
                        fromUserId: author.id,
                        toUserId: moderator.id,
                        content: `Safety report integration test ${suffix}`
                    }
                });
                createdFeedbackIds.push(feedback.id);

                const report = await prisma.safetyReport.create({
                    data: {
                        feedbackId: feedback.id,
                        reporterId: reporter.id,
                        reason: `Integration test report ${suffix}`
                    }
                });
                createdReportIds.push(report.id);
                return report;
            };

            const resolvedReport = await makeReport("resolved");
            const dismissedReport = await makeReport("dismissed");

            server = app.listen(0, "127.0.0.1");
            await new Promise((resolve, reject) => {
                server.once("error", reject);
                server.once("listening", resolve);
            });

            const address = server.address();
            const baseUrl = `http://127.0.0.1:${address.port}`;
            const tokenFor = (userId) =>
                jwt.sign({ userId }, process.env.JWT_SECRET);
            const patchStatus = (reportId, newStatus, userId, explanation) =>
                fetch(`${baseUrl}/api/moderation/reports/${reportId}/status`, {
                    method: "PATCH",
                    headers: {
                        authorization: `Bearer ${tokenFor(userId)}`,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ newStatus, explanation })
                });

            const pendingResponse = await fetch(
                `${baseUrl}/api/moderation/pending`,
                {
                    headers: {
                        authorization: `Bearer ${tokenFor(moderator.id)}`
                    }
                }
            );
            assert.equal(pendingResponse.status, 200);
            const pendingReports = await pendingResponse.json();
            const pendingReportIds = new Set(
                pendingReports.map(({ id }) => id)
            );
            assert.ok(pendingReportIds.has(resolvedReport.id));
            assert.ok(pendingReportIds.has(dismissedReport.id));

            const forbiddenResponse = await patchStatus(
                resolvedReport.id,
                "UNDER_REVIEW",
                reporter.id
            );
            assert.equal(forbiddenResponse.status, 403);

            const invalidTransitionResponse = await patchStatus(
                resolvedReport.id,
                "RESOLVED",
                moderator.id
            );
            assert.equal(invalidTransitionResponse.status, 400);

            await assert.rejects(
                services.updateReportStatus(
                    resolvedReport.id,
                    "UNDER_REVIEW",
                    randomUUID()
                )
            );
            assert.equal(
                (await prisma.safetyReport.findUnique({
                    where: { id: resolvedReport.id }
                })).status,
                "PENDING"
            );
            assert.equal(
                await prisma.safetyReportAction.count({
                    where: { reportId: resolvedReport.id }
                }),
                0
            );

            const reviewResponse = await patchStatus(
                resolvedReport.id,
                "UNDER_REVIEW",
                moderator.id,
                "  reviewed with context  "
            );
            assert.equal(reviewResponse.status, 200);
            assert.equal((await reviewResponse.json()).status, "UNDER_REVIEW");

            const resolveResponse = await patchStatus(
                resolvedReport.id,
                "RESOLVED",
                moderator.id,
                "  resolved after review  "
            );
            assert.equal(resolveResponse.status, 200);
            assert.equal((await resolveResponse.json()).status, "RESOLVED");

            const dismissReviewResponse = await patchStatus(
                dismissedReport.id,
                "UNDER_REVIEW",
                moderator.id
            );
            assert.equal(dismissReviewResponse.status, 200);

            const dismissResponse = await patchStatus(
                dismissedReport.id,
                "DISMISSED",
                moderator.id
            );
            assert.equal(dismissResponse.status, 200);
            assert.equal((await dismissResponse.json()).status, "DISMISSED");

            const resolvedActions = await prisma.safetyReportAction.findMany({
                where: { reportId: resolvedReport.id },
                select: {
                    moderatorId: true,
                    previousStatus: true,
                    newStatus: true,
                    explanation: true
                },
                orderBy: { createdAt: "asc" }
            });
            const compareByNewStatus = (left, right) =>
                left.newStatus.localeCompare(right.newStatus);
            assert.deepEqual(resolvedActions.sort(compareByNewStatus), [
                {
                    moderatorId: moderator.id,
                    previousStatus: "UNDER_REVIEW",
                    newStatus: "RESOLVED",
                    explanation: "resolved after review"
                },
                {
                    moderatorId: moderator.id,
                    previousStatus: "PENDING",
                    newStatus: "UNDER_REVIEW",
                    explanation: "reviewed with context"
                }
            ].sort(compareByNewStatus));

            const dismissedActions = await prisma.safetyReportAction.findMany({
                where: { reportId: dismissedReport.id },
                select: {
                    moderatorId: true,
                    previousStatus: true,
                    newStatus: true,
                    explanation: true
                },
                orderBy: { createdAt: "asc" }
            });
            assert.deepEqual(dismissedActions.sort(compareByNewStatus), [
                {
                    moderatorId: moderator.id,
                    previousStatus: "UNDER_REVIEW",
                    newStatus: "DISMISSED",
                    explanation: null
                },
                {
                    moderatorId: moderator.id,
                    previousStatus: "PENDING",
                    newStatus: "UNDER_REVIEW",
                    explanation: null
                }
            ].sort(compareByNewStatus));
        } finally {
            if (server?.listening) {
                await new Promise((resolve, reject) => {
                    server.close((error) => error ? reject(error) : resolve());
                });
            }

            if (createdReportIds.length) {
                await prisma.safetyReportAction.deleteMany({
                    where: { reportId: { in: createdReportIds } }
                });
                await prisma.safetyReport.deleteMany({
                    where: { id: { in: createdReportIds } }
                });
            }
            if (createdFeedbackIds.length) {
                await prisma.feedback.deleteMany({
                    where: { id: { in: createdFeedbackIds } }
                });
            }
            if (createdUserIds.length) {
                await prisma.user.deleteMany({
                    where: { id: { in: createdUserIds } }
                });
            }
            await prisma.$disconnect();
        }
    }
);
