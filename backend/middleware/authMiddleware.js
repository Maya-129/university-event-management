const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    next();
};


const requireRole = (role) => {
    return (req, res, next) => {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }

        if (req.session.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission."
            });
        }

        next();
    };
};


module.exports = {
    requireLogin,
    requireRole
};