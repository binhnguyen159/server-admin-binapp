const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('auth-token');
    console.log(token);

    if (!token) return res.status(401).send('Unauthorize');
    try {
        const verified = jwt.verify(token, process.env.KEY_SECRET);
        next()
    } catch (error) {
        return res.status(400).send('Invalid Token');
    }
}