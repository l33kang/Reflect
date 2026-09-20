import {
    createFeedback as createFeedbackServices,
    getFeedbackForUser as getFeedbackForUserServices
} from '../services/feedbackServices.js';

const createFeedback = async (req, res) => {
    const {toUserId, content} = req.body;
    const fromUserId = req.user.userId;

    if(!toUserId || !content) {
        return res.status(400).json({error: "An error has accord"});
    }

    try {
        const feedback = await createFeedbackServices({fromUserId, toUserId, content});
        return res.status(201).json(feedback);
    } catch(err) {
        console.error(err);
        if(err.message === "You can't send a feedback to yourself!") {
            return res.status(400).json({error: "You can't send a feedback to yourself!"});
        }
        return res.status(500).json({error: "Could not create Feedback"})
    }

}

const getFeedbackForUser = async (req, res) =>{
    try{
        const {userId} = req.params;
        const feedbacks = await getFeedbackForUserServices(userId);
        return res.status(200).json({feedbacks});
    } catch (err){
        return res.status(500).json({error: "Could not fetch Feedbacks"});
    }
}

export {
    createFeedback,
    getFeedbackForUser
}