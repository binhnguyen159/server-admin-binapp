const express = require('express');
const app = express()
const mongoose = require('mongoose');
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
require('dotenv').config();
const connect = require('./util/connect');
const adminRoute = require('./routes/adminRoute');
const contactRoute = require('./routes/contact');
const verifyToken = require('./middlewares/verifyToken');
connect.connectFirebase();
connect.connectMongoDB()
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(process.env.PORT);
app.get('/', async (req, res) => {
    // const data = await firebase.firestore()
    //     .collection('users')
    //     .get()
    //     .then(snapshot => {
    //         const data = snapshot.docs.map(item => {
    //             return item.id;
    //         })
    //         return data
    //     })
    // console.log(data);
    res.send({ 'data asdads ghgf': "asd212121" })
})
app.use('/admin', adminRoute)
app.use('/video-call', contactRoute)
// app.use('*')