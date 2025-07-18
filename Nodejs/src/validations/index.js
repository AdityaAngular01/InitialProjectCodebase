const {loginSchema, registerSchema} = require("./auth.validation");
module.exports = {
    auth: {
        loginSchema,
        registerSchema
    },
}