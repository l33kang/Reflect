import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {getUserReputation, getReputationHistoryController} from '../controllers/reputationControllers.js';

const router = express.Router();
const reputationHistoryRouter = express.Router();

router.get('/:username/reputation', authMiddleware, getUserReputation);
reputationHistoryRouter.get("/:userId/history", authMiddleware, getReputationHistoryController);

export { reputationHistoryRouter };
export default router;