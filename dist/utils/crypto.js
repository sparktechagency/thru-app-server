"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = exports.compareOtp = exports.hashOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../config"));
const OTP_EXPIRY_MINUTES = 2;
const cryptoToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.default = cryptoToken;
const hashOtp = async (otp) => {
    const hashedOtp = await bcrypt_1.default.hash(otp, Number(config_1.default.bcrypt_salt_rounds));
    return hashedOtp;
};
exports.hashOtp = hashOtp;
const compareOtp = async (otp, hashedOtp) => {
    const isMatch = await bcrypt_1.default.compare(otp, hashedOtp);
    return isMatch;
};
exports.compareOtp = compareOtp;
const generateOtp = async () => {
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    const expiresIn = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const hashedOtp = await (0, exports.hashOtp)(otp);
    return { otp, expiresIn, hashedOtp };
};
exports.generateOtp = generateOtp;
