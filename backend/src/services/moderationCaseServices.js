import prisma from "../config/database.js";

const createModerationAction = async (
    caseId,
    moderatorId,
    actionType,
    rationale
) => {
    if (typeof actionType !== "string" || !actionType.trim()) {
        throw new Error("Action type is required");
    }

    if (
        rationale !== undefined &&
        rationale !== null &&
        typeof rationale !== "string"
    ) {
        throw new Error("Rationale must be a string");
    }

    return prisma.$transaction(async (tx) => {
        const moderationCase = await tx.moderationCase.findUnique({
            where: {
                id: caseId
            },
            include: {
                report: {
                    include: {
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

        const allowedActions = [
            "WARN",
            "REMOVE_CONTENT",
            "RESTRICT"
        ];

        if (!allowedActions.includes(actionType)) {
            throw new Error("Invalid moderation action");
        }

        if (actionType === "RESTRICT") {
            await tx.user.update({
                where: {
                    id: moderationCase.report.feedback.toUserId
                },
                data: {
                    status: "RESTRICTED"
                }
            });
        }

        if (actionType === "REMOVE_CONTENT") {
            await tx.feedback.update({
                where: {
                    id: moderationCase.report.feedbackId
                },
                data: {
                    isHidden: true
                }
            });

            await tx.safetyReport.update({
                where: {
                    id: moderationCase.report.id
                },
                data: {
                    status: "RESOLVED"
                }
            });
        }

        const moderationAction = await tx.moderationAction.create({
            data: {
                caseId,
                moderatorId,
                action: actionType.trim(),
                explanation: rationale?.trim() || null
            }
        });

        if (actionType === "REMOVE_CONTENT") {
            await tx.notification.create({
                data: {
                    userId: moderationCase.report.reporterId,
                    type: "SAFETY_REPORT_UPDATE",
                    message: "Your report was reviewed, and the reported feedback was removed."
                }
            });
        }

        if (actionType === "WARN") {
            await tx.notification.create({
                data: {
                    userId: moderationCase.report.feedback.toUserId,
                    type: "MODERATION_WARNING",
                    message: "You have received a warning from Reflect moderation."
                }
            });
        }

        if (actionType === "RESTRICT") {
            await tx.notification.create({
                data: {
                    userId: moderationCase.report.feedback.toUserId,
                    type: "ACCOUNT_RESTRICTED",
                    message: "Your Reflect account has been restricted by moderation."
                }
            });
        }

        return moderationAction;
    });
};

const getModerationCase = async (caseId) => {
    const moderationCase = await prisma.moderationCase.findUnique({
        where: {
            id: caseId
        },
        include: {
            report: {
                include: {
                    feedback: {
                        select: {
                            id: true,
                            content: true,
                            fromUserId: true,
                            toUserId: true,
                            createdAt: true
                        }
                    },
                    reporter: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            },
            actions: {
                orderBy: {
                    createdAt: "asc"
                },
                include: {
                    moderator: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            },
            appeals: {
                orderBy: {
                    createdAt: "asc"
                },
                include: {
                    appellant: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            }
        }
    });

    if (!moderationCase) {
        throw new Error("Moderation case not found");
    }

    return moderationCase;
};

const getModerationCases = async () => {
    return prisma.moderationCase.findMany({
        orderBy: {
            createdAt: "desc"
        },
        include: {
            report: {
                select: {
                    id: true,
                    feedbackId: true,
                    reporterId: true,
                    reason: true,
                    status: true,
                    createdAt: true
                }
            },
            _count: {
                select: {
                    actions: true,
                    appeals: true
                }
            }
        }
    });
};

const getOrCreateModerationCase = async (reportId) => {
    const existingCase = await prisma.moderationCase.findUnique({
        where: {
            reportId
        }
    });

    if (existingCase) {
        return existingCase;
    }

    return prisma.moderationCase.create({
        data: {
            reportId
        }
    });
};

const getModerationCaseHistory = async (caseId) => {
    const moderationCase = await prisma.moderationCase.findUnique({
        where: {
            id: caseId
        },
        select: {
            id: true
        }
    });

    if (!moderationCase) {
        throw new Error("Moderation case not found");
    }

    return prisma.moderationAction.findMany({
        where: {
            caseId
        },
        orderBy: {
            createdAt: "asc"
        },
        include: {
            moderator: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });
};

export {
    createModerationAction,
    getModerationCase,
    getModerationCases,
    getModerationCaseHistory,
    getOrCreateModerationCase
};