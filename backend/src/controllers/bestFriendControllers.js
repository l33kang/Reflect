import {
    addBestFriend,
    removeBestFriend,
    getBestFriends
} from "../services/bestFriendServices.js";

const createBestFriend = async (req, res) => {
    try {
        const result = await addBestFriend(
            req.user.userId,
            req.params.friendId
        );

        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const deleteBestFriend = async (req, res) => {
    try {
        const result = await removeBestFriend(
            req.user.userId,
            req.params.friendId
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const listBestFriends = async (req, res) => {
    try {
        const result = await getBestFriends(req.params.userId, req.user.userId);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

export {
    createBestFriend,
    deleteBestFriend,
    listBestFriends
};