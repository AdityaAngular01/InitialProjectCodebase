const {userService} = require("../service/user.service");
const {httpCodes} = require("../config");
const {reqQueryFilterOptionsPicker} = require("../utils");

exports.updateUser = async (request, response)=>{
    const userId = request.params.userId;
    const updatedUserBody = request.body;
    const updatedUser = await userService.updateUser(userId, updatedUserBody);
    return response.status(httpCodes.OK).json(updatedUser);
}

exports.updatePassword = async (request, response)=>{
    const userId = request.params.userId;
    const updatedPassword = await userService.updatePassword(userId, request.body.password);
    return response.status(httpCodes.OK).json(updatedPassword);
}

exports.updateRole = async (request, response)=>{
    const userId = request.params.userId;
    const updatedRole = await userService.updateRole(userId, request.body.role);
    return response.status(httpCodes.OK).json(updatedRole);
}

exports.updateName = async (request, response)=>{
    const userId = request.params.userId;
    const updatedName = await userService.updateName(userId, request.body.name);
    return response.status(httpCodes.OK).json(updatedName);
}

exports.updateEmail = async (request, response)=>{
    const userId = request.params.userId;
    const updatedEmail = await userService.updateEmail(userId, request.body.email);
    return response.status(httpCodes.OK).json(updatedEmail);
}

exports.update = async (request, response)=>{
    const { update } = request.params;
    let res;
    switch (update) {
        case 'email':
            res = await this.updateEmail(request, response);
            break;
        case 'name':
            res = await this.updateName(request, response);
            break;
        case 'password':
            res = await this.updatePassword(request, response);
            break;
        case 'role':
            res = await this.updateRole(request, response);
            break;
    }
    return res;
}


exports.userInfo = async (request, response)=>{
    const userInfo = await userService.userInfo(request.user._id, 2);
    return response.ok(userInfo);
}

exports.getAllUsers = async (request, response)=>{
    const {filter, options} = reqQueryFilterOptionsPicker(request);
    const users = await userService.getAllUsers(filter, options);
    return response.ok(users);
}

exports.queryUsers = async (request, response)=>{
    const {filter, options} = reqQueryFilterOptionsPicker(request);
    const result = await userService.queryUsers(filter, options);
    return response.ok(result, `User query results successfully`);
}