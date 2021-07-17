const express = require('express')
const router = express.Router();
const videoCall = require('../util/video-call/videoCall')

router.get('/get-token', (req, res) => {
    if (!req.query || !req.query.userName) {
        return res.status(400).send('Username parameter is required');
    }
    videoCall.createToken(req.query.userName)
    return res.send(videoCall.createToken(req.query.userName));
})



module.exports = router;