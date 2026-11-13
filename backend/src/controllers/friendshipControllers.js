import {
    getFriends as getFriendsService,
    getFriendsById as getFriendsByIdService,
    unfriend as unfriendService
} from '../services/friendshipServices.js';

const getFriends = async (req, res) => {
    const userId = req.user.userId;

    try{
        const result = await getFriendsService(userId);
        return res.status(200).json(result);
    } catch(err) {
        if(err.message === "No friendships found"){
            return res.status(404).json({error: "No friendships found"});
        } else {
            return res.status(500).json({error: "Could not fetch friends"});
        }
    }
}

const getFriendsById = async (req, res) => {
    const requesterId = req.user.userId;
    const targetUserId = req.params.userId;
    try{
        const result = await getFriendsByIdService(requesterId, targetUserId);
        return res.status(200).json(result);
    } catch(err) {
        if(err.message === "User not found") {
            return res.status(404).json({error: "User Not Found!"});
        } else if(err.message === "Friends list is private") {
            return res.status(403).json({error: "Friends List Is Private"});
        } else {
            return res.status(500).json({error: "Something went wrong"});
        }
    } 
}

const unfriend = async (req, res) => {
    const userId = req.user.userId;
    const {friendId} = req.params;

    try{
        const result = await unfriendService(userId, friendId);
        return res.status(200).json(result);
    } catch(err) {
        if(err.message === "Friendship not found") {
            return res.status(404).json({error: "Friendship not found"});
        } else {
            return res.status(500).json({error: "Could not unfriend"});
        }
    }
}

export {
    getFriends,
    getFriendsById,
    unfriend
}