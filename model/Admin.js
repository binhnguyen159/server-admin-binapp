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
}, { timestamps: true });

const Admin = model('Admin', AdminSchema);

module.exports = Admin;