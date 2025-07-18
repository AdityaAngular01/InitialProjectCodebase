const {name, email, password} = require("./shared.validation");
const {JOI} = require("../package");

const registerSchema = JOI.object({
    name: name,
    email: email,
    password:password,
    role: JOI.string().optional()
})

const loginSchema = JOI.object({
    email: email,
    password: password
})

module.exports = {
    registerSchema,
    loginSchema
}