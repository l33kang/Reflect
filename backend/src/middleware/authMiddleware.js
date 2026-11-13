import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const authMiddleware = async (req, res, next) => {

    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            error: "Not found"
        });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "An error accourd"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({error: "Invalid or expired token"});
    }

    if (!decoded || typeof decoded.userId !== "string") {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId
        },
        select: {
            id: true,
            status: true
        }
    });

    if (!user) {
        return res.status(401).json({
            error: "User not found"
        });
    }

    req.user = {
        userId: user.id,
        status: user.status
    };
    next();
};

export default authMiddleware;