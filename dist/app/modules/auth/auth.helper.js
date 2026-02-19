"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHelper = void 0;
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const config_1 = __importDefault(require("../../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createToken = (authId, role, name, email, profile, fcmToken) => {
    const accessToken = jwtHelper_1.jwtHelper.createToken({ authId, role, name, email, profile, fcmToken }, config_1.default.jwt.jwt_secret, config_1.default.jwt.jwt_expire_in);
    const refreshToken = jwtHelper_1.jwtHelper.createToken({ authId, role, name, email, fcmToken }, config_1.default.jwt.jwt_refresh_secret, config_1.default.jwt.jwt_refresh_expire_in);
    return { accessToken, refreshToken };
};
const tempAccessToken = (authId, role, name, email, profile, fcmToken) => {
    const accessToken = jwtHelper_1.jwtHelper.createToken({ authId, role, name, email, profile, fcmToken }, 'asjdhashd#$uaas98', config_1.default.jwt.jwt_expire_in);
    return { accessToken };
};
const isPasswordMatched = async (plainTextPassword, hashedPassword) => {
    return await bcrypt_1.default.compare(plainTextPassword, hashedPassword);
};
const isTokenInvalidated = (passwordChangedAt, tokenIssuedAt) => {
    // Convert Mongoose Date (ms) to Unix Timestamp (seconds)
    const passwordChangedTime = Math.floor(passwordChangedAt.getTime() / 1000);
    return passwordChangedTime > tokenIssuedAt;
};
exports.AuthHelper = { createToken, isPasswordMatched, isTokenInvalidated };
