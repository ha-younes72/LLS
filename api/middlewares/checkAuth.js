const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "secretprivatekey");
        req.userData = decoded;
        next();
    } catch (error) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, "ownerprivatekey");
            req.userData = decoded;
            next();
        } catch (error) {
            try {
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, "adminprivatekey");
                req.userData = decoded;
                next();
            } catch (error) {
                res.status(401).json({
                    message: "Auth failed"
                })
            }
        }
    }
}