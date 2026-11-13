
import {
    blockUser,
    unblockUser,
    getBlockedUsers,
} from "../services/blockServices.js";

const block = async (req, res) => {
    try {
        const result = await blockUser(
            req.user.userId,
            req.params.userId
        );

        return res.status(201).json(result);
    } catch (error) {
        const status = error.message === "User not found" ? 404 : 400;
        return res.status(status).json({ message: error.message });
    }
};

const unblock = async (req, res) => {
    try {
        const result = await unblockUser(
            req.user.userId,
            req.params.userId
        );

        return res.status(200).json(result);
    } catch (error) {
        const status = error.message === "Block not found" ? 404 : 400;
        return res.status(status).json({ message: error.message });
    }
};

const listBlockedUsers = async (req, res) => {
    try {
        const result = await getBlockedUsers(req.user.userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve blocked users" });
    }
};

export { block, unblock, listBlockedUsers };
