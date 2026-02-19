"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSanitizeEmail = exports.authResponse = exports.AuthCommonServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const auth_helper_1 = require("./auth.helper");
const crypto_1 = require("../../../utils/crypto");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const verification_model_1 = require("../verification/verification.model");
const verification_interface_1 = require("../verification/verification.interface");
const config_1 = __importDefault(require("../../../config"));
const handleLoginLogic = async (payload, user) => {
    const { _id, email, name, role, verified, authentication, password: hashedPassword, } = user;
    const { isRestricted, restrictionLeftAt, wrongLoginAttempts = 0, } = authentication || {};
    // 1. Initial Lockout Check
    if (isRestricted && restrictionLeftAt && new Date() < restrictionLeftAt) {
        const remaining = Math.ceil((restrictionLeftAt.getTime() - Date.now()) / 60000);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, `Account temporarily locked. Try again in ${remaining} minutes.`);
    }
    // 2. Password Matching
    const isMatch = await user_model_1.User.isPasswordMatched(payload.password, hashedPassword);
    if (!isMatch) {
        const attempts = wrongLoginAttempts + 1;
        const shouldLock = attempts >= Number(config_1.default.max_wrong_attempts);
        const updateQuery = {
            $inc: { 'authentication.wrongLoginAttempts': 1 },
            $set: { 'authentication.isRestricted': shouldLock },
        };
        if (shouldLock) {
            const lockUntil = new Date(Date.now() + Number(config_1.default.restriction_minutes) * 60 * 1000);
            // Strategy Toggle: STRICT_EARLIEST (min) vs EXTEND (set)
            if (config_1.default.lock_out_strategy === 'EXTEND') {
                updateQuery.$min = { 'authentication.restrictionLeftAt': lockUntil };
            }
            else {
                updateQuery.$set['authentication.restrictionLeftAt'] = lockUntil;
            }
        }
        await user_model_1.User.findByIdAndUpdate(_id, updateQuery);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid credentials, please try again with valid one.');
    }
    // 3. Verification Check (Using UPSERT for Verification model)
    if (!verified) {
        const existingOTP = await verification_model_1.Verification.findOne({
            identifier: email,
            type: verification_interface_1.VERIFICATION_TYPE.ACCOUNT_ACTIVATION,
        });
        if (existingOTP) {
            // A. Check Cooldown (Time-based)
            if (existingOTP.latestRequest) {
                const secondsSinceLast = (Date.now() - existingOTP.latestRequest.getTime()) / 1000;
                if (secondsSinceLast < Number(config_1.default.otp_request_cooldown_seconds)) {
                    const waitTime = Math.ceil(Number(config_1.default.otp_request_cooldown_seconds) - secondsSinceLast);
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, `Please wait ${waitTime} seconds.`);
                }
            }
            // B. Check Request Limit (Volume-based) - NEW
            if (existingOTP.requestCount >= Number(config_1.default.max_otp_request_allowed || 5)) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, 'Maximum OTP limit reached. Please try again in 15 minutes.');
            }
        }
        const { otp, expiresIn, hashedOtp } = await (0, crypto_1.generateOtp)();
        // Upsert ensures we don't crash on duplicate identity keys
        await verification_model_1.Verification.findOneAndUpdate({ identifier: email, type: verification_interface_1.VERIFICATION_TYPE.ACCOUNT_ACTIVATION }, {
            $set: {
                otpHash: hashedOtp,
                otpExpiresAt: expiresIn,
                latestRequest: new Date(),
                attempts: 0, // IMPORTANT: Reset failed OTP attempts when a new one is sent
                // Reset the TTL timer to 15 mins from NOW
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        }, { upsert: true, new: true });
        // Offload to helper (consider using a queue here for true production scale)
        emailHelper_1.emailHelper.sendEmail(emailTemplate_1.emailTemplate.createAccount({ email, otp, name }));
        return (0, exports.authResponse)(http_status_codes_1.StatusCodes.FORBIDDEN, 'Account unverified. OTP sent.');
    }
    // 4. Success - Reset Security Counters
    await user_model_1.User.findByIdAndUpdate(_id, {
        $set: {
            'authentication.wrongLoginAttempts': 0,
            'authentication.isRestricted': false,
            'authentication.restrictionLeftAt': null,
            ...(payload.fcmToken && { fcmToken: payload.fcmToken }),
        },
    });
    const tokens = auth_helper_1.AuthHelper.createToken(_id, role, name, email);
    // Best Practice: Return options as an object to keep code readable
    return (0, exports.authResponse)(http_status_codes_1.StatusCodes.OK, `Welcome back ${name}`, {
        role,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    });
};
exports.AuthCommonServices = {
    handleLoginLogic,
};
const authResponse = (status, message, options = {}) => {
    return {
        status,
        message,
        ...options,
    };
};
exports.authResponse = authResponse;
const getSanitizeEmail = (email) => {
    return email.toLowerCase().trim();
};
exports.getSanitizeEmail = getSanitizeEmail;
