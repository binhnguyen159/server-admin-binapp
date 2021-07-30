const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(403).send('Unauthorize');
    try {
        jwt.verify(token, process.env.KEY_SECRET);
        // res.send(data)
        next();
    } catch (error) {
        return res.status(400).send('Invalid Token');
    }
}