import { 
    sendFriendRequest as sendFriendRequestService,
    acceptFriendRequest as acceptFriendRequestService,
    rejectFriendRequest as rejectFriendRequestService,
     cancelFriendRequest as cancelFriendRequestService,
    incomingFriendRequests as incomingFriendRequestsService,
    outgoingFriendRequests as outgoingFriendRequestsService
    } from '../services/friendRequestServices.js';


const sendFriendRequest = async (req, res) => {
    const senderId = req.user.userId;
    const recipientId = req.body?.recipientId;

    if (typeof recipientId !== "string" || !recipientId.trim()) {
        return res.status(400).json({error: "Recipient ID is required"});
    }

    try{
        const friendRequest = await sendFriendRequestService(senderId, recipientId);
        return res.status(201).json(friendRequest);
    } catch(err) {
        if (err.message === "Not possible") {
            return res.status(400).json({error: "You cannot send a friend request to yourself"});
        } else if (err.message === "User not found") {
            return res.status(404).json({error: "User not found"});
        } else if (err.message === "Friendship already exists") {
            return res.status(400).json({error: "Friendship already exists"});
        } else if (err.message === "Friend request already exists") {
            return res.status(400).json({error: "Friend request already exists"});
        } else if (err.message === "You already have a friend request from this user") {
            return res.status(400).json({error: "You already have a friend request from this user"});
        }else {
            console.error(err);
            return res.status(500).json({error: "Could not send friend request"});
        }
    }
}

const acceptFriendRequest = async (req, res) => {
    const {requestId} = req.params;
    const userId = req.user.userId;

    try{
        const result = await acceptFriendRequestService(requestId, userId);
        return res.status(200).json(result);
    } catch(err) {
        if (err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else if (err.message === "Request is not pending") {
            return res.status(400).json({error: "Request is not pending"});
        } else if (err.message === "Not found!") {
            return res.status(404).json({error: "Not found!"});
        } else {
            return res.status(500).json({error: "Could not accept friend request"});
        }
    }
}

const rejectFriendRequest = async (req, res) => {
    const {requestId} = req.params;
    const userId = req.user.userId;

    try{
        const result = await rejectFriendRequestService(requestId, userId);
        return res.status(200).json(result);
    } catch(err) {
        if (err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else if (err.message === "Request is not pending") {
            return res.status(400).json({error: "Request is not pending"});
        } else if (err.message === "Not found!") {
            return res.status(404).json({error: "Not found!"});
        } else {
            return res.status(500).json({error: "Could not reject friend request"});
        }
    }
}

const cancelFriendRequest = async (req, res) => {
    const {requestId} = req.params;
    const userId = req.user.userId;

    try{
        const result = await cancelFriendRequestService(requestId, userId);
        return res.status(200).json(result);
    } catch(err) {
        if (err.message === "Not authorized") {
            return res.status(403).json({error: "Not authorized"});
        } else if (err.message === "Request is not pending") {
            return res.status(400).json({error: "Request is not pending"});
        } else if (err.message === "Not found!") {
            return res.status(404).json({error: "Not found!"});
        } else {
            return res.status(500).json({error: "Could not cancel friend request"});
        }
    }
}

const incomingFriendRequests = async (req, res) => {
    const userId =req.user.userId;

    try{
        const result = await incomingFriendRequestsService(userId);
        return res.status(200).json(result);
    } catch(err) {
        if(err.message === "No incoming friend requests") {
            return res.status(404).json({error: "No incoming friend requests"});
        } else {
            return res.status(500).json({error: "Could not fetch friend requests"});
        }
    }
}


const outgoingFriendRequests = async (req, res) => {
    const userId =req.user.userId;

    try{
        const result = await outgoingFriendRequestsService(userId);
        return res.status(200).json(result);
    } catch(err) {
        if(err.message === "No outgoing friend requests") {
            return res.status(404).json({error: "No outgoing friend requests"});
        } else {
            return res.status(500).json({error: "Could not fetch friend requests"});
        }
    }
}
export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    incomingFriendRequests,
    outgoingFriendRequests
}
