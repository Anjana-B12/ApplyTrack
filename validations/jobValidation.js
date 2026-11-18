const Joi = require("joi");

const applicationSchema = Joi.object({
    company: Joi.string().trim().required(),
    position: Joi.string().trim().required(),
    location: Joi.string().allow(""),
    jobType: Joi.string().valid("Full-time", "Part-time", "Internship", "Apprenticeship"),
    appliedDate: Joi.date().required(),
    status: Joi.string().valid("Applied", "Interview", "Rejected", "Offer").required(),
    jobLink: Joi.string().uri().allow(""),
    description: Joi.string().allow(""),
    notes: Joi.string().allow("")
});

module.exports = applicationSchema;
