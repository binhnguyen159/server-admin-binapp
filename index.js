const express = require('express');
const app = express();
const upload = require("express-fileupload");
// var multer = require('multer');
// var upload = multer();
require('dotenv').config();
const connect = require('./util/connect');
const adminRoute = require('./routes/adminRoute');
const contactRoute = require('./routes/contact');
connect.connectFirebase();
connect.connectMongoDB()
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth-token");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload({ useTempFiles: true }))
// app.use(upload.array());
app.use(express.static('public'));

app.listen(process.env.PORT);
app.get('/', async (req, res) => {
    res.send({ 'data asdads ghgf': "asd212121" })
})
app.use('/admin', adminRoute)
app.use('/video-call', contactRoute)
// app.use('*')