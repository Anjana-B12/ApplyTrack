const { required } = require("joi");
const mongoose = require("mongoose");
const { type } = require("../validations/userValidation");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
