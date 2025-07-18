const {userRepository} = require("../repository");
const {ApiError} = require("../utils");
const {httpCodes} = require("../config")

exports.updateUser = async (_id, updatedUser)=>{
    const user = await userRepository.updateUser(_id, updatedUser);
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.updatePassword = async (_id, newPassword)=>{
    const user = await userRepository.updateUser(_id, {password: newPassword});
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.updateRole = async (_id, newRole)=>{
    const user = await userRepository.updateUser(_id, {role: newRole});
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.updateName = async (_id, newName)=>{
    const user = await userRepository.updateUser(_id, {name: newName});
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.updateEmail = async (_id, newEmail)=>{
    const user = await userRepository.updateUser(_id, {email: newEmail});
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.userInfo = async(_id, depth)=>{
    const user = await userRepository.userById(_id, depth);
    if(!user){
        throw new ApiError(httpCodes.BAD_REQUEST, "User not found");
    }
    return user;
}

exports.getAllUsers = async(filter, options)=> await userRepository.getAllUsers(filter, options);

exports.queryUsers = async(filter, options)=> await userRepository.queryUsers(filter, options);