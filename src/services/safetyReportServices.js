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


const updateReportStatus = async (
    reportId,
    newStatus,
    moderatorId,
    explanation
) => {
    if (
        explanation !== undefined &&
        explanation !== null &&
        typeof explanation !== "string"
    ) {
        throw new Error("Explanation must be a string");
    }
    
    return await prisma.$transaction(async (tx) => {
       
        const report = await tx.safetyReport.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            throw new Error("Report not found");
        }

        
        if (
            report.status !== "PENDING" &&
            report.status !== "UNDER_REVIEW"
        ) {
            throw new Error("Report cannot be updated from its current status");
        }

        if (
            report.status === "PENDING" &&
            newStatus !== "UNDER_REVIEW"
        ) {
            throw new Error(
                "Pending reports must be moved to UNDER_REVIEW first"
            );
        }

        if (
            report.status === "UNDER_REVIEW" &&
            newStatus !== "RESOLVED" &&
            newStatus !== "DISMISSED"
        ) {
            throw new Error(
                "Under-review reports must be RESOLVED or DISMISSED"
            );
        }

        
        const updatedReport = await tx.safetyReport.update({
            where: { id: reportId },
            data: { status: newStatus }
        });

        await tx.safetyReportAction.create({
            data: {
                reportId,
                moderatorId,
                previousStatus: report.status,
                newStatus,
                explanation: explanation?.trim() || null
            }
        });

        let message;

        if(newStatus === "UNDER_REVIEW") {
            message = "Your safety report is now being reviewed."
        } else if(newStatus === "RESOLVED"){
            message = "Your safety report has been resolved."
        } else if(newStatus === "DISMISSED") {
            message = "Your safety report has been reviewed and dismissed."
        }

        await tx.notification.create({
            data:{
                userId: report.reporterId,
                type: "SAFETY_REPORT_UPDATE",
                message
            }
        })

        return updatedReport;
    });
};

const getReportHistory = async (reportId) => {
    const report = await prisma.safetyReport.findUnique({
        where: { id: reportId },
        select: { id: true }
    });

    if (!report) {
        throw new Error("Report not found");
    }

    const history = await prisma.safetyReportAction.findMany({
        where: { reportId },
        orderBy: { createdAt: "asc" },
        include: {
            moderator: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    return history;
};

export {
    createReport,
    getPendingReports,
    updateReportStatus,
     getReportHistory
}