const mongoose = require('mongoose');
const {httpCodes, httpStatus, env} = require("../config")
// const logger = require('../config/logger.config');
const {ApiError} = require('../utils');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error ? httpCodes.BAD_REQUEST : httpCodes.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus.status[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (env === 'production' && !err.isOperational) {
        statusCode = httpCodes.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(env === 'development' && { stack: err.stack }),
    };

    if (env === 'development') {
        // logger.error(err);
    }

    res.status(statusCode).json(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};