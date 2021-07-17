const { connect } = require('twilio-video');

const connect = (token, { roomName }).then(room => {
    console.log(`Successfully joined a Room: ${room}`);
    room.on('participantConnected', participant => {
        console.log(`A remote Participant connected: ${participant}`);
    });
}, error => {
    console.error(`Unable to connect to Room: ${error.message}`);
});