const joi = require('joi')

function userValidation(body) {
 const userValidationSchema = joi.object({
    email : joi.string().email().trim().required(),
    password : joi.string().min(8).max(30).required()
 })
 return userValidationSchema.validate(body)
}

module.exports = userValidation