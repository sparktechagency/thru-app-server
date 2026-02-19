"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const jwtHelper_1 = require("../../helpers/jwtHelper");
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../../shared/logger");
const config_1 = __importDefault(require("../../config"));
const handleZodError_1 = __importDefault(require("../../errors/handleZodError"));
const socketAuth = (...roles) => {
    return (socket, next) => {
        try {
            const { auth, query, headers } = socket.handshake;
            const token = (auth === null || auth === void 0 ? void 0 : auth.token) ||
                (query === null || query === void 0 ? void 0 : query.token) ||
                (headers === null || headers === void 0 ? void 0 : headers.authorization) ||
                (headers === null || headers === void 0 ? void 0 : headers.Authorization);
            if (!token) {
                logger_1.logger.error(colors_1.default.red('Socket connection attempt failed: No token provided in auth, query, or headers'));
                return next(new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Authentication token is required to access this resource'));
            }
            try {
                let jwtToken = extractToken(token);
                // Verify token
                const verifiedUser = jwtHelper_1.jwtHelper.verifyToken(jwtToken, config_1.default.jwt.jwt_secret);
                // Attach user to socket
                socket.user = {
                    authId: verifiedUser.authId,
                    name: verifiedUser.name,
                    email: verifiedUser.email,
                    role: verifiedUser.role,
                    ...verifiedUser,
                };
                // Guard user based on roles
                if (roles.length && !roles.includes(verifiedUser.role)) {
                    logger_1.logger.error(colors_1.default.red(`Socket authentication failed: User role ${verifiedUser.role} not authorized`));
                    return next(new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You don't have permission to access this socket event"));
                }
                logger_1.logger.info(colors_1.default.green(`Socket authenticated for user: ${verifiedUser.authId}`));
                next();
            }
            catch (error) {
                if (error instanceof Error && error.name === 'TokenExpiredError') {
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Access Token has expired');
                }
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Invalid Access Token');
            }
        }
        catch (error) {
            if (error instanceof ApiError_1.default) {
                const apiError = error;
                const errorResponse = {
                    statusCode: apiError.statusCode,
                    error: getErrorName(apiError.statusCode),
                    message: apiError.message,
                };
                socket.emit('socket_error', errorResponse);
            }
            next(error);
        }
    };
};
const handleSocketRequest = (socket, ...roles) => {
    try {
        const { auth, query, headers } = socket.handshake;
        const token = (auth === null || auth === void 0 ? void 0 : auth.token) ||
            (query === null || query === void 0 ? void 0 : query.token) ||
            (headers === null || headers === void 0 ? void 0 : headers.authorization) ||
            (headers === null || headers === void 0 ? void 0 : headers.Authorization);
        let jwtToken = extractToken(token);
        // Verify token
        const verifiedUser = jwtHelper_1.jwtHelper.verifyToken(jwtToken, config_1.default.jwt.jwt_secret);
        // Guard user based on roles
        if (roles.length && !roles.includes(verifiedUser.role)) {
            socket.emit('socket_error', createErrorResponse(http_status_codes_1.StatusCodes.FORBIDDEN, "You don't have permission to access this socket event"));
            return null;
        }
        return {
            ...verifiedUser,
        };
    }
    catch (error) {
        handleSocketError(socket, error);
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Access Token has expired');
        }
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Invalid Access Token');
    }
};
function createErrorResponse(statusCode, message, errorMessages) {
    return {
        statusCode,
        error: getErrorName(statusCode),
        message,
        ...(errorMessages && { errorMessages }),
    };
}
function handleSocketError(socket, error) {
    if (error instanceof ApiError_1.default) {
        socket.emit('socket_error', createErrorResponse(error.statusCode, error.message));
    }
    else {
        socket.emit('socket_error', createErrorResponse(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error'));
    }
    logger_1.logger.error(colors_1.default.red(`Socket error: ${error.message}`), error);
}
function extractToken(token) {
    if (typeof token !== 'string')
        return token;
    let cleanToken = token.trim();
    // Handle JSON-stringified token objects
    if (cleanToken.startsWith('{')) {
        try {
            const parsed = JSON.parse(cleanToken);
            const nestedToken = parsed.token || parsed.accessToken || parsed.jwt;
            if (nestedToken)
                cleanToken = nestedToken;
        }
        catch (e) {
            // Not JSON, continue
        }
    }
    // Handle Bearer prefix
    if (cleanToken.toLowerCase().startsWith('bearer ')) {
        return cleanToken.split(' ')[1];
    }
    return cleanToken;
}
function getErrorName(statusCode) {
    switch (statusCode) {
        case http_status_codes_1.StatusCodes.BAD_REQUEST:
            return 'Bad Request';
        case http_status_codes_1.StatusCodes.UNAUTHORIZED:
            return 'Unauthorized';
        case http_status_codes_1.StatusCodes.FORBIDDEN:
            return 'Forbidden';
        case http_status_codes_1.StatusCodes.NOT_FOUND:
            return 'Not Found';
        default:
            return 'Error';
    }
}
/**
 * Validate socket event data against schema
 */
const validateEventData = (socket, schema, data) => {
    try {
        return schema.parse(data);
    }
    catch (error) {
        const zodError = (0, handleZodError_1.default)(error);
        socket.emit('socket_error', {
            statusCode: zodError.statusCode,
            error: getErrorName(zodError.statusCode),
            message: zodError.message,
            errorMessages: zodError.errorMessages,
        });
        return null;
    }
};
exports.socketMiddleware = {
    socketAuth,
    validateEventData,
    handleSocketRequest,
};
