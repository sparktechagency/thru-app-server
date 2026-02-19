"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
const plan_model_1 = require("../plan/plan.model");
const user_1 = require("../../../enum/user");
const logger_1 = require("../../../shared/logger");
const config_1 = __importDefault(require("../../../config"));
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const user_constants_1 = require("./user.constants");
const friend_service_1 = require("../friend/friend.service");
const request_model_1 = require("../request/request.model");
const request_interface_1 = require("../request/request.interface");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const updateProfile = async (user, payload) => {
    if (typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number') {
        payload.location = {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude], // lng, lat
        };
    }
    const updatedProfile = await user_model_1.User.findOneAndUpdate({ _id: user.authId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, {
        $set: payload,
    }, { new: true });
    if (!updatedProfile) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update profile.');
    }
    return updatedProfile;
};
const createAdmin = async () => {
    const admin = {
        email: config_1.default.admin.email,
        name: 'Admin',
        password: config_1.default.admin.password,
        role: user_1.USER_ROLES.ADMIN,
        status: user_1.USER_STATUS.ACTIVE,
        verified: true,
        authentication: {
            oneTimeCode: null,
            restrictionLeftAt: null,
            expiresAt: null,
            latestRequestAt: new Date(),
            authType: '',
        },
    };
    const isAdminExist = await user_model_1.User.findOne({
        email: admin.email,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (isAdminExist) {
        logger_1.logger.log('info', 'Admin account already exist, skipping creation.🦥');
        return isAdminExist;
    }
    const result = await user_model_1.User.create([admin]);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create admin');
    }
    return result[0];
};
const uploadImages = async (user, payload) => {
    const { authId } = user;
    const userExist = await user_model_1.User.findById(authId);
    if (!userExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The requested user not found.');
    }
    const { images, type } = payload;
    if (type === 'cover') {
        userExist.cover = images[0];
    }
    else if (type === 'profile') {
        userExist.profile = images[0];
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(authId, userExist, {
        new: false,
    });
    if (!updatedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Failed to upload ${type} image. Please try again.`);
    }
    if (updatedUser[type]) {
        await (0, remove_1.default)(updatedUser[type]);
    }
    return 'Images uploaded successfully.';
};
const getUserProfile = async (user) => {
    const isUserExist = await user_model_1.User.findById(user.authId);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The requested user not found.');
    }
    return isUserExist;
};
const getUsers = async (user, query) => {
    const { latitude, longitude, radius } = query;
    // Base query with mandatory conditions
    let baseQuery = user_model_1.User.find({
        role: user_1.USER_ROLES.USER,
        verified: true
    });
    // Handle geospatial search if coordinates are provided
    if (latitude && longitude && radius) {
        baseQuery = baseQuery.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(longitude) || 0, Number(latitude) || 0],
                    },
                    $maxDistance: Number(radius) || 10000,
                },
            },
        });
    }
    const selectFields = user.role === user_1.USER_ROLES.USER ? '-location -verified -role -createdAt -updatedAt' : '';
    const userQuery = new QueryBuilder_1.default(baseQuery, query)
        .search(user_constants_1.user_searchable_fields)
        .filter()
        .sort()
        .paginate();
    if (selectFields) {
        userQuery.modelQuery = userQuery.modelQuery.select(selectFields);
    }
    const [result, friendList, friendRequests] = await Promise.all([
        userQuery.modelQuery,
        friend_service_1.FriendServices.getMyFriendList(user, { planId: null }),
        request_model_1.Request.find({
            $or: [
                { requestedBy: user.authId },
                { requestedTo: user.authId }
            ],
            type: request_interface_1.REQUEST_TYPE.FRIEND,
            status: request_interface_1.REQUEST_STATUS.PENDING
        })
    ]);
    const friendIdSet = new Set(friendList.map(friend => friend === null || friend === void 0 ? void 0 : friend._id.toString()));
    const sentRequestsSet = new Set(friendRequests
        .filter(req => req.requestedBy.toString() === user.authId)
        .map(req => req.requestedTo.toString()));
    const receivedRequestsSet = new Set(friendRequests
        .filter(req => req.requestedTo.toString() === user.authId)
        .map(req => req.requestedBy.toString()));
    const usersWithFriendFlag = result.map(userDoc => {
        const userObj = userDoc.toObject ? userDoc.toObject() : userDoc;
        const userId = userObj._id.toString();
        let friendStatus = 'none';
        if (friendIdSet.has(userId)) {
            friendStatus = 'friend';
        }
        else if (sentRequestsSet.has(userId)) {
            friendStatus = 'request_sent';
        }
        else if (receivedRequestsSet.has(userId)) {
            friendStatus = 'request_received';
        }
        return {
            ...userObj,
            friendStatus,
        };
    });
    const meta = await userQuery.getPaginationInfo();
    return {
        data: usersWithFriendFlag,
        meta,
    };
};
const getUserActivityLog = async (user, pagination) => {
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const now = new Date();
    const whereConditions = {
        $and: [
            {
                $or: [
                    { createdBy: user.authId },
                    { friends: user.authId }
                ]
            },
            { date: { $lt: now } }
        ]
    };
    const [result, total] = await Promise.all([
        plan_model_1.Plan.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate('activities')
            .populate('friends'),
        plan_model_1.Plan.countDocuments(whereConditions),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
exports.UserServices = { updateProfile, createAdmin, uploadImages, getUserProfile, getUsers, getUserActivityLog };
