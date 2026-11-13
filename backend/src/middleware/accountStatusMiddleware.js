const requireActiveAccount = (req, res, next) => {
    if (req.user?.status === "RESTRICTED") {
        return res.status(403).json({
            error: "Your account is restricted"
        });
    }

    next();
};

export default requireActiveAccount;