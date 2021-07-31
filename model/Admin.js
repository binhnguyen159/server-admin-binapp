const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const model = mongoose.model;
const AdminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true,
        min: 6
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Admin = model('Admin', AdminSchema);

module.exports = Admin;