const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    position: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100
    },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Internship", "Apprenticeship"]
    },
    appliedDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Applied", "Interview", "Rejected", "Offer"],
        required: true,
    },
    jobLink: {
        type: String,
        trim: true,
        maxlength: 2048
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
