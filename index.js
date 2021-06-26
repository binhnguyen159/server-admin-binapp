const express = require('express');
const app = express()
const mongoose = require('mongoose');
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
require('dotenv').config();
const connect = require('./util/connect');
const adminRoute = require('./routes/adminRoute')
connect.connectFirebase();
connect.connectMongoDB()
// mongoose.connect(process.env.URL_MONGODB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// }).then(() => {
//     app.listen(process.env.PORT)
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(process.env.PORT)
app.get('/', async (req, res) => {
    const data = await firebase.firestore()
        .collection('users')
        .get()
        .then(snapshot => {
            const data = snapshot.docs.map(item => {
                return item.id;
            })
            return data
        })
    console.log(data);
    res.send(data)
})

app.use('/admin', adminRoute)
