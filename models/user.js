const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        unique: true, 
        required: true
    },
	firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    age: {
        type: String,
        trim: true
    },
    weight: {
        type: String,
        trim: true
    },
    height: {
        type: String,
        trim: true
    },
	roles: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    lat: {
        type: String,
        trim: true
    },
    lng: {
        type: String,
        trim: true
    },
    imgURL: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date
    },
    blockedAt: {
        type: Date
    },
    deleteAt: {
        type: Date
    }
});

module.exports = mongoose.model("User", UserSchema);