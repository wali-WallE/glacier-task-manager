const Joi = require('joi');

const teamSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().allow('', null).max(255)
});

const taskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow('', null),
    team_id: Joi.alternatives().try(Joi.string(), Joi.number().integer()).required(),
    assigned_to: Joi.number().integer().allow('', null)
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};

module.exports = { validateRequest, teamSchema, taskSchema, registerSchema, loginSchema };
