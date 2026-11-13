import {
    addHobby,
    removeHobby,
    getUserHobbies
} from "../services/hobbyServices.js";

const createHobby = async (req, res) => {
    try {
        const hobby = await addHobby(
            req.user.userId,
            req.body.name
        );

        return res.status(201).json(hobby);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const deleteHobby = async (req, res) => {
    try {
        const result = await removeHobby(
            req.user.userId,
            req.params.hobbyId
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const listUserHobbies = async (req, res) => {
    try {
        const hobbies = await getUserHobbies(req.params.userId, req.user.userId);

        return res.status(200).json(hobbies);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

export {
    createHobby,
    deleteHobby,
    listUserHobbies
};