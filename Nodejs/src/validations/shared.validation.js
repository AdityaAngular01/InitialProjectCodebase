const {JOI} = require("../package");

const email = JOI.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required"
})

const password = JOI.string()
  .min(6)
  .max(30)
  .required()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,30}$/)
  .messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must not exceed 30 characters",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    "any.required": "Password is required",
  });


const name = JOI.string().min(3).max(50).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required"
});

const description = JOI.string().min(3).max(50).required().messages({
    "string.min": "Description must be at least 3 characters long",
    "string.max": "Description must not exceed 50 characters",
    "any.required": "Description is required"
});

const mongooseId = JOI.string().length(24).hex().required();

module.exports = {
    // Authentication Validations
    email,
    password,
    name,
    description,
    mongooseId
}