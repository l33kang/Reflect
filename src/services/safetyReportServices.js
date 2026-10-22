import prisma from "../config/database.js";

const createReport = async (feedbackId, reporterId, reason) => {
    const feedback = await prisma.feedback.findUnique({
        where: {
            id: feedbackId
        }
    });
    if(!feedback) {
        throw new Error("Not found!");
    }
    if(feedback.fromUserId === reporterId) {
        throw new Error("You can't report your own feedback");
    }
    const exist = await prisma.safetyReport.findUnique({
        where: {
            feedbackId_reporterId: {
                feedbackId,
                reporterId
            }
        }
    });
    if(exist) {
        throw new Error("You have already reported this feedback");
    }

    if(typeof reason !== "string" || !reason.trim()){
        throw new Error("A report reason is required");
    }

    const report = await prisma.safetyReport.create({
        data: {
            feedbackId,
            reporterId,
            reason: reason.trim()
        }
    });

    return report;
}

const getPendingReports = async () => {
    const reports = await prisma.safetyReport.findMany({
        where: {
            status: 'PENDING'
        },
        orderBy: {
            createdAt: "asc"
        },
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
    })
    return reports;
}

export {
    createReport,
    getPendingReports
}