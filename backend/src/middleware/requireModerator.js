import prisma from '../config/database.js';

const requireModerator = async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.userId
        },
        select: {
            role: true
        }
    });

    if (!user || user.role !== "MODERATOR") {
        return res.status(403).json({ error: "Forbidden: moderators only" });
    }

    next();
};

export default requireModerator;