const Joi = require("joi");

const applicationSchema = Joi.object({
    company: Joi.string().trim().max(100).required(),
    position: Joi.string().trim().max(100).required(),
    location: Joi.string().trim().max(100).allow(""),
    jobType: Joi.string().valid("Full-time", "Part-time", "Internship", "Apprenticeship"),
    appliedDate: Joi.date().required(),
    status: Joi.string().valid("Applied", "Interview", "Rejected", "Offer").required(),
    jobLink: Joi.string().trim().max(2048).uri().allow(""),
    description: Joi.string().trim().max(1000).allow(""),
    notes: Joi.string().trim().max(1000).allow("")
});

module.exports = applicationSchema;
