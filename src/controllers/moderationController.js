import { 
    getPendingReports as getPendingReportsServices,
    updateReportStatus as updateReportStatusServices,
    getReportHistory as getReportHistoryServices,
    hideReportedFeedback as hideReportedFeedbackServices
    } from "../services/safetyReportServices.js";

const getPendingReports = async (req, res) => {
    try {
        const reports = await getPendingReportsServices();
        return res.status(200).json(reports);
    } catch(error) {
        return res.status(500).json({error: "Something went wrong"});
    }
}

const updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { newStatus, explanation } = req.body ?? {};
    const moderatorId = req.user.userId;

    if (!reportId || !newStatus) {
        return res.status(400).json({
            error: "Report ID and new status are required"
        });
    }

    const allowedStatuses = [
        "UNDER_REVIEW",
        "RESOLVED",
        "DISMISSED"
    ];

    if (!allowedStatuses.includes(newStatus)) {
        return res.status(400).json({
            error: "Invalid report status"
        });
    }

    if (
        explanation !== undefined &&
        explanation !== null &&
        typeof explanation !== "string"
    ) {
        return res.status(400).json({
            error: "Explanation must be a string"
        });
    }

    try {
        const updatedReport = await updateReportStatusServices(
            reportId,
            newStatus,
            moderatorId,
            explanation
        );

        return res.status(200).json(updatedReport);
    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({ error: err.message });
        }

        if (
            err.message === "Report cannot be updated from its current status" ||
            err.message === "Pending reports must be moved to UNDER_REVIEW first" ||
            err.message === "Under-review reports must be RESOLVED or DISMISSED"
        ) {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
};


const getReportHistory = async (req, res) => {
    const { reportId } = req.params;

    try {
        const history = await getReportHistoryServices(reportId);
        return res.status(200).json(history);
    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({ error: err.message });
        }

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
};

const hideReportedFeedback = async (req, res) => {
    const { reportId } = req.params;
    const moderatorId = req.user.userId;

    if (!reportId) {
        return res.status(400).json({
            error: "Report ID is required"
        });
    }

    try {
        const report = await hideReportedFeedbackServices(
            reportId,
            moderatorId
        );

        return res.status(200).json({
            message: "Feedback hidden and report resolved",
            report
        });
    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({ error: err.message });
        }

        if (
            err.message ===
            "The report must be under review before feedback can be hidden"
        ) {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
};

export {
    getPendingReports,
    updateReportStatus,
    getReportHistory,
    hideReportedFeedback
}