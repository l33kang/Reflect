import {
    getUserReputation as getUserReputationService
} from '../services/reputationServices.js';

const getUserReputation = async (req, res) => {
    const {username} = req.params;
    const requesterId = req.user.userId;

    try{
        const reputation = await getUserReputationService(username, requesterId);
        return res.status(200).json(reputation);
    } catch (err) {
        if (err.message === "User not found") {
            return res.status(404).json({error: "User not found"});
        }
        if (err.message === "Reputation is private") {
            return res.status(403).json({error: "Reputation is private"});
        }
        console.error(err);
        return res.status(500).json({error: "Could not fetch reputation"});

    }
}

export {
    getUserReputation
}