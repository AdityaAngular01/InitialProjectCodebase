const { UserModel: User } = require("../models");
const {jwtToken} = require("../package");
const {jwtSecret} = require("../config");

exports.createUser = async (newUser) => {
    const user = new User(newUser);
    return await user.save();
}

exports.findByEmail = async (email, select='', depth=0) => await User.findOne({email: email}).select(select).setOptions({depth});

exports.comparePassword = async (user, enteredPassword) =>  await user.comparePassword(enteredPassword);

exports.updateUser = async (_id, updatedUser)=> await  User.findByIdAndUpdate(_id, updatedUser, {new: true});

exports.deleteUser = async (_id) => await User.findByIdAndDelete(_id);

exports.userById = async (userId, depth=0) => await User.findById(userId).setOptions({depth});

exports.createToken = async(user) => jwtToken.sign(user, jwtSecret);

exports.getAllUsers = async(filter={}, options={}) => await User.find(filter).setOptions({depth: parseInt(options.depth) || 0});

exports.queryUsers = async(filter={},options={}) => await User.paginate(filter, {...options, depth: parseInt(options.depth) || 0});