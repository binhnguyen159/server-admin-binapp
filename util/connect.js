const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
const mongoose = require('mongoose');
const express = require('express');
const app = express()

const firebaseConfig = {
    apiKey: "AIzaSyCXLmeQDDhgnD7Mc9unoOCXfGFi6CbYwsw",
    authDomain: "instagram-app-f3d8d.firebaseapp.com",
    databaseURL: "https://instagram-app-f3d8d-default-rtdb.firebaseio.com",
    projectId: "instagram-app-f3d8d",
    storageBucket: "instagram-app-f3d8d.appspot.com",
    messagingSenderId: "667814295313",
    appId: "1:667814295313:web:05870d02051472646efeb0",
    measurementId: "G-V4VQKMFJ28"
};

const connectFirebase = () => {
    firebase.initializeApp(firebaseConfig)
}

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.URL_MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log('connect successfully!!!');
    } catch (error) {
        console.log('connect failed!!!');
    }
}



module.exports = {
    connectFirebase,
    connectMongoDB
}