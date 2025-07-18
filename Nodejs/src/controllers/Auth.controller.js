const { authService } = require("../service");
// const { ApiError } = require("../util");

exports.register = async (req, res) => {
    const newUser = req.body;
    const user = await authService.register(newUser);
    return res.created(user, "Sign-Up Successful");
}

exports.login = async (req, res) => {
    const user = await authService.login(req.body.email, req.body.password);
    return res.ok(user, "Login successful")
}
