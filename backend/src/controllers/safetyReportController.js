import {
    createReport as createReportServices
} from "../services/safetyReportServices.js";

const createReport = async (req, res) =>{
    const {feedbackId} = req.params;
    const reporterId = req.user.userId;
    const {reason} = req.body;

    try{
        const report = await createReportServices(feedbackId, reporterId, reason);
        return res.status(201).json(report);
    } catch(err) {
        if(err.message === "Not found!"){
            return res.status(404).json({error: "Feedback Not Found!"});
        } else if(err.message === "You have already reported this feedback") {
            return res.status(403).json({error: "You can't report your own feedback"});
        } else if(err.message === "A report reason is required") {
            return res.status(400).json({error: "A reporter reason is required"});
        } 
        else {
            return res.status(500).json({error: "Something went wrong"});
        }
    }
}

export {
    createReport
}