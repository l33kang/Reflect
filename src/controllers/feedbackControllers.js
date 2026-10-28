import {
    createFeedback as createFeedbackServices,
    getFeedbackForUser as getFeedbackForUserServices,
    updateFeedbackVisibility as updateFeedbackVisibilityServices,
    deleteFeedback as deleteFeedbackServices,
    createFeedbackResponse as createFeedbackResponseServices,
    getFeedbackResponses as getFeedbackResponseServices,
    revealFeedbackIdentity as revealFeedbackIdentityServices
} from '../services/feedbackServices.js';

const createFeedback = async (req, res) => {
    const {
        toUserId,
        content,
        type,
        dimension,
        isAnonymous,
        allowIdentityReveal
    } = req.body;
    const fromUserId = req.user.userId;

    if ( !toUserId || typeof content !== "string" || !content.trim() || content.trim().length > 500 ||!type || !dimension) {
    return res.status(400).json({error: "toUserId, type, dimension and valid feedback content are required"});
    }
    const clearContent = content.trim();

    if(
        typeof isAnonymous !== "boolean" ||
        typeof allowIdentityReveal !== "boolean"
    ) {
        return res.status(400).json({error: "isAnonymous and allowIdentityReveal must be booleans"});
    }

    if(!isAnonymous && allowIdentityReveal) {
        return res.status(400).json({error: "Identity reveal permission is only needed for anonymous feedback"});
    }

    try {
        const feedback = await createFeedbackServices({
            fromUserId,
            toUserId,
            content: clearContent,
            type,
            dimension,
            isAnonymous,
            allowIdentityReveal
        });
        return res.status(201).json(feedback);
    } catch(err) {
        console.error(err);
        if(err.message === "You can't send a feedback to yourself!") {
            return res.status(400).json({error: "You can't send a feedback to yourself!"});
        } else if(err.message === "You are not allowed to make this feedback") {
            return res.status(400).json({error: "You are not allowed to make this feedback"})
        } else if(err.message === "User not found!") {
            return res.status(404).json({error: "User not found!"});
        } else if (
            err.message === "Invalid type" ||
            err.message === "Invalid dimension"
        ) {
            return res.status(400).json({ error: err.message });
        } else if(err.message === "Interaction not allowed") {
            return res.status(403).json({error: "Interaction not allowed"});
        } else {
            return res.status(500).json({error: "Could not create Feedback"});
        }
        
    }

}

const getFeedbackForUser = async (req, res) =>{
    try{
        const {userId: targetUserId} = req.params;
        const requesterId = req.user.userId;
        const feedbacks = await getFeedbackForUserServices(requesterId, targetUserId);
        return res.status(200).json({feedbacks});
    } catch (err){
         console.error(err);
        return res.status(500).json({error: "Could not fetch Feedbacks"});
    }
}

const revealFeedbackIdentity = async (req, res) => {
    const {feedbackId} = req.params;
    const requesterId = req.user.userId;

    try {
        const identity = await revealFeedbackIdentityServices(feedbackId, requesterId);
        return res.status(200).json({ identity });
    } catch (err) {
        if (err.message === "Feedback not found!") {
            return res.status(404).json({ error: err.message });
        }

        if (err.message === "Not authorized") {
            return res.status(403).json({ error: err.message });
        }

        if (err.message === "Identity reveal not permitted") {
            return res.status(403).json({ error: err.message });
        }

        console.error(err);
        return res.status(500).json({ error: "Could not reveal identity" });
    }
}

const updateFeedbackVisibility = async (req, res) => {
    const {feedbackId} = req.params;
    const requesterId =  req.user.userId;
    const {visibility} = req.body ?? {};

    if (!["PRIVATE", "PUBLIC"].includes(visibility)) {
        return res.status(400).json({error: 'Bad request!'});
    }
    try{
        const updatedFeedback = await updateFeedbackVisibilityServices(feedbackId, requesterId, visibility);
        return res.status(200).json(updatedFeedback);
    } catch (err) {
        if(err.message === "Not found!") {
            return res.status(404).json({error: "Not found!"});
        } else if(err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else {
            console.log(err.message);
            return res.status(500).json({error: "Something went wrong"});
        }
    }
}

const deleteFeedback = async (req, res) => {
    const { feedbackId } = req.params;
    const requesterId = req.user.userId;

    try {
        const deletedFeedback = await deleteFeedbackServices(feedbackId, requesterId);
        return res.status(200).json(deletedFeedback);
    } catch (err) {
        if(err.message === "Not found!") {
            return res.status(404).json({error: "Not found"});
        } else if(err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else {
            return res.status(500).json({error: "Something went wrong!"});
        }
    }
}

const createFeedbackResponse = async (req, res) => {
    const {feedbackId} = req.params;
    const {responseType, body} = req.body;
    const responderId = req.user.userId;

    const allowedTypes = [
        "UNDERSTAND",
        "DISAGREE",
        "DISCUSS",
        "SORRY",
        "CHANGED",
        "INACCURATE",
        "REVIEW_REQUEST"
    ];

    if(!allowedTypes.includes(responseType)){
        return res.status(400).json({error: "Invalid response type"});
    }

    if(
        body !== undefined &&
        (typeof body !== "string" || body.trim().length > 500)
    ) {
        return res.status(400).json({error: "Response body must be a string of at most 500 characters"});
    }

    try{
        const response = await createFeedbackResponseServices({
            feedbackId,
            responderId,
            responseType,
            body: body?.trim() || null
        });

        return res.status(201).json(response);
    } catch(err) {
        if(err.message === "Not found!") {
            return res.status(404).json({error: "Feedback Not Found!"});
        } else if(err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized for this action"});
        } else {
            console.log(err.message)
            return res.status(500).json({error: "Something went wrong"});
        }
    }
}

const getFeedbackResponse = async (req, res) => {
    const {feedbackId} = req.params;
    const requesterId = req.user.userId;
    
    try{
        const response = await getFeedbackResponseServices(feedbackId, requesterId);
        return res.status(200).json(response);
    } catch(err) {
        if(err.message === "Feedback not found!"){
            return res.status(404).json({error: "Feedback not found!"});
        } else if (err.message === "Not authorized!"){
            return res.status(403).json({error: "Not authorized for this action"});
        } else {
            return res.status(500).json({error: "Something went went wrong"});
        }
    }
}

export {
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback,
    createFeedbackResponse,
    getFeedbackResponse,
    revealFeedbackIdentity
}