const requireActiveAccount = (req, res, next) => {
    if (req.user.status !== "ACTIVE") {
        return res.status(403).json({
            error: "Account is not active"
        });
    }

    next();
};

export default requireActiveAccount;
