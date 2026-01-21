const Joi = require("joi");

// login admin
const loginAdminValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options({
  abortEarly: false,
});


module.exports = {
    loginAdminValidation,
}