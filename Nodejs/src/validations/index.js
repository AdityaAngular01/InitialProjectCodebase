const {loginSchema, registerSchema} = require("./auth.validation");
const {createProject} = require("./project.validation");
module.exports = {
    auth: {
        loginSchema,
        registerSchema
    },
}