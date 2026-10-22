import { getPendingReports as getPendingReportsServices } from "../services/safetyReportServices.js";

const getPendingReports = async (req, res) => {
    try {
        const reports = await getPendingReportsServices();
        return res.status(200).json(reports);
    } catch(error) {
        return res.status(500).json({error: "Something went wrong"});
    }
}

export {
    getPendingReports
}