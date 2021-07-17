const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const v4 = require('uuid').v4

const videoGrant = new VideoGrant({
    room: v4(),
});
const createToken = (identity) => {
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_SECRET_KEY);
    token.addGrant(videoGrant);
    token.identity = identity;
    return token.toJwt();
}
module.exports = {
    createToken
}
