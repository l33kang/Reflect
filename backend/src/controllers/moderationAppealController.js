import {
    createAppeal,
    resolveAppeal
} from "../services/moderationAppealServices.js";

const submitAppeal = async (req, res) => {
    try {
        const appeal = await createAppeal(
            req.params.caseId,
            req.user.userId,
            req.body.statement
        );

        return res.status(201).json(appeal);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const resolveAppealController = async (req, res) => {
    try {
        const appeal = await resolveAppeal(
            req.params.appealId,
            req.user.userId,
            req.body.status
        );

        return res.json(appeal);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

export {
    submitAppeal,
    resolveAppealController
};