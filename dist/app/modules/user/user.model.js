"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enum/user");
const config_1 = __importDefault(require("../../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
    },
    status: {
        type: String,
        enum: [user_1.USER_STATUS.ACTIVE, user_1.USER_STATUS.RESTRICTED, user_1.USER_STATUS.DELETED],
        default: user_1.USER_STATUS.ACTIVE,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    profile: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        default: user_1.USER_ROLES.USER,
    },
    address: {
        type: String,
    },
    includedPlans: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Plan',
        }],
    totalDays: {
        type: String,
        default: "3 days 4 hours"
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            default: [0.0, 0.0],
        },
    },
    authentication: {
        type: {
            isRestricted: {
                type: Boolean,
                default: false,
            },
            restrictionLeftAt: {
                type: Date,
                default: null,
            },
            wrongLoginAttempts: {
                type: Number,
                default: 0,
            },
            passwordChangedAt: {
                type: Date,
                default: null,
            },
        },
        default: {},
        select: false,
    },
    appId: {
        type: String,
        select: false,
    },
    fcmToken: {
        type: String,
        select: false,
    },
}, {
    timestamps: true,
});
userSchema.index({ location: '2dsphere' });
userSchema.statics.isPasswordMatched = async function (givenPassword, savedPassword) {
    return await bcrypt_1.default.compare(givenPassword, savedPassword);
};
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    next();
});
exports.User = (0, mongoose_1.model)('User', userSchema);
