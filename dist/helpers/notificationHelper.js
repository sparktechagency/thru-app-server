"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notifications_model_1 = require("../app/modules/notifications/notifications.model");
const logger_1 = require("../shared/logger");
const pushnotificationHelper_1 = require("./pushnotificationHelper");
const socketInstances_1 = require("./socketInstances");
const sendNotification = async (from, to, title, body, friendRequestId, planJoiningRequestId, fcmToken) => {
    try {
        const result = await notifications_model_1.Notification.create({
            from: from.authId,
            to,
            title,
            body,
            friendRequestId,
            planJoiningRequestId,
            isRead: false,
        });
        if (!result)
            logger_1.logger.warn('Notification not sent');
        const socketResponse = {
            _id: result._id,
            from: {
                _id: from.authId,
                name: from === null || from === void 0 ? void 0 : from.name,
                profile: from === null || from === void 0 ? void 0 : from.profile,
            },
            to,
            title,
            body,
            friendRequestId: friendRequestId,
            planJoiningRequestId: planJoiningRequestId,
            isRead: false,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
        (0, socketInstances_1.emitEvent)(`notification::${to}`, socketResponse);
        if (fcmToken) {
            await (0, pushnotificationHelper_1.sendPushNotification)(fcmToken, title, body, { from: from.authId, to });
        }
    }
    catch (err) {
        //@ts-ignore
        logger_1.logger.error(err, 'FROM NOTIFICATION HELPER');
    }
};
exports.sendNotification = sendNotification;
