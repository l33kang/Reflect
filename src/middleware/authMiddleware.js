import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

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

    req.user = decoded;
    next();
   

    console.log(header);
};

export default authMiddleware;