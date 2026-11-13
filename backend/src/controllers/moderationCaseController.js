import {
    createModerationAction,
    getModerationCase,
    getModerationCases,
    getModerationCaseHistory
} from "../services/moderationCaseServices.js";

const createAction = async (req, res) => {
    try {
        const action = await createModerationAction(
            req.params.caseId,
            req.user.userId,
            req.body.actionType,
            req.body.rationale
        );

        return res.status(201).json(action);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
};

const getCase = async (req, res) => {
    try {
        const moderationCase = await getModerationCase(
            req.params.caseId
        );

        return res.json(moderationCase);
    } catch (error) {
        return res.status(404).json({
            error: error.message
        });
    }
};

const getCases = async (req, res) => {
    try {
        const cases = await getModerationCases();

        return res.json(cases);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const getCaseHistory = async (req, res) => {
    try {
        const history = await getModerationCaseHistory(
            req.params.caseId
        );

        return res.json(history);
    } catch (error) {
        return res.status(404).json({
            error: error.message
        });
    }
};

export {
    createAction,
    getCase,
    getCases,
    getCaseHistory
};