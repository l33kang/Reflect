import {
    createFeedback as createFeedbackServices,
    getFeedbackForUser as getFeedbackForUserServices,
    updateFeedbackVisibility as updateFeedbackVisibilityServices,
    deleteFeedback as deleteFeedbackServices
} from '../services/feedbackServices.js';

const createFeedback = async (req, res) => {
    const {toUserId, content} = req.body;
    const fromUserId = req.user.userId;

    if ( !toUserId || typeof content !== "string" || !content.trim() || content.trim().length > 500) {
    return res.status(400).json({error: "toUserId and valid feedback content are required"});
    }
    const clearContent = content.trim();

    try {
        const feedback = await createFeedbackServices({fromUserId, toUserId, content: clearContent});
        return res.status(201).json(feedback);
    } catch(err) {
        console.error(err);
        if(err.message === "You can't send a feedback to yourself!") {
            return res.status(400).json({error: "You can't send a feedback to yourself!"});
        }

        if(err.message === "User not found!") {
            return res.status(404).json({error: "User not found!"});
        }
        return res.status(500).json({error: "Could not create Feedback"})
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

const updateFeedbackVisibility = async (req, res) => {
    const {feedbackId} = req.params;
    const requesterId =  req.user.userId;
    const {isPublic} = req.body;

    if (typeof(isPublic) != 'boolean') {
        return res.status(400).json({error: 'Bad request!'});
    }
    try{
        const updatedFeedback = await updateFeedbackVisibilityServices(feedbackId, requesterId, isPublic);
        return res.status(200).json(updatedFeedback);
    } catch (err) {
        if(err.message === "Not found!") {
            return res.status(404).json({error: "Not found!"});
        } else if(err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else {
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

export {
    createFeedback,
    getFeedbackForUser,
    updateFeedbackVisibility,
    deleteFeedback
}