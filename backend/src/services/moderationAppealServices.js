import prisma from "../config/database.js";

const createAppeal = async (caseId, filedBy, statement) => {
    if (typeof statement !== "string" || !statement.trim()) {
        throw new Error("Appeal statement is required");
    }

    const moderationCase = await prisma.moderationCase.findUnique({
        where: {
            id: caseId
        },
        include: {
            report: {
                select: {
                    feedback: {
                        select: {
                            toUserId: true
                        }
                    }
                }
            }
        }
    });

    if (!moderationCase) {
        throw new Error("Moderation case not found");
    }

    if (
        moderationCase.report.feedback.toUserId !== filedBy
    ) {
        throw new Error("You are not authorized to appeal this case");
    }

    const existingAppeal = await prisma.moderationAppeal.findFirst({
        where: {
            caseId,
            filedBy,
            status: "OPEN"
        }
    });

    if (existingAppeal) {
        throw new Error("You already have an open appeal for this case");
    }

    return prisma.moderationAppeal.create({
        data: {
            caseId,
            filedBy,
            statement: statement.trim()
        }
    });
};

const resolveAppeal = async (appealId, moderatorId, status) => {
    if (status !== "UPHELD" && status !== "OVERTURNED") {
        throw new Error("Invalid appeal status");
    }

    const appeal = await prisma.moderationAppeal.findUnique({
        where: {
            id: appealId
        }
    });

    if (!appeal) {
        throw new Error("Appeal not found");
    }

    if (appeal.status !== "OPEN") {
        throw new Error("Appeal has already been resolved");
    }

    return prisma.moderationAppeal.update({
        where: {
            id: appealId
        },
        data: {
            status,
            resolvedAt: new Date()
        }
    });
};

export {
    createAppeal,
    resolveAppeal
};
