// middlewares/authenticate.js
const {jwtToken:jwt} = require('../../package.json');
const {UserModel:User} = require('../models');
const {jwtSecret} = require("../config");

module.exports = async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token missing' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findById(decoded._id).populate({
            path: 'role',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }

        req.user = user; // user will be available in req.user in next middlewares/controllers
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};
