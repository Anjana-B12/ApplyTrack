const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String
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
        type: String
    },
    description: {
        type: String
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
