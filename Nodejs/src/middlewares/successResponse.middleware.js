const successResponse = (req, res, next) => {
    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to format success responses only for 2xx codes
    res.json = function (data, message = 'Operation completed successfully', statusCode = 200) {
        // Get the current status code (defaults to 200 if not set)
        const currentStatus = res.statusCode || statusCode;

        // Bypass formatting for non-2xx status codes or if data contains success: false
        if (currentStatus < 200 || currentStatus >= 300 || (data && typeof data === 'object' && data.success === false)) {
            return originalJson.call(this, data);
        }

        // Set status code
        res.status(statusCode);

        // Standard success response format
        const response = {
            success: true,
            message,
            data: data || null,
            timestamp: new Date().toISOString(),
        };

        return originalJson.call(this, response);
    };

    // Flexible success response with custom status code
    res.success = function (data, message = 'Operation completed successfully', statusCode = 200) {
        return this.json(data, message, statusCode);
    };

    // 200 OK
    res.ok = function (data, message = 'Resource retrieved successfully') {
        return this.json(data, message, 200);
    };

    // 201 Created
    res.created = function (data, message = 'Resource created successfully') {
        return this.json(data, message, 201);
    };

    // 202 Accepted
    res.accepted = function (data, message = 'Request accepted for processing') {
        return this.json(data, message, 202);
    };

    // 204 No Content
    res.noContent = function (data, message = 'Action completed successfully') {
        // For strict 204 compliance, return no body if data is null and no custom message
        if (data === null && message === 'Action completed successfully') {
            return res.status(204).end();
        }
        return this.json(data, message, 204);
    };

    // 206 Partial Content
    res.partialContent = function (data, message = 'Partial resource delivered') {
        return this.json(data, message, 206);
    };

    next();
};

module.exports = successResponse;