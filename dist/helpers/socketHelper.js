"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../shared/logger");
const server_1 = require("../server");
const user_1 = require("../enum/user");
const socketAuth_1 = require("../app/middleware/socketAuth");
const socket = (io) => {
    // Apply authentication middleware to all connections
    io.use(socketAuth_1.socketMiddleware.socketAuth(user_1.USER_ROLES.CUSTOMER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.GUEST, user_1.USER_ROLES.USER));
    io.on('connection', (socket) => {
        if (socket.user) {
            server_1.onlineUsers.set(socket.id, socket.user.authId);
            logger_1.logger.info(colors_1.default.blue(`⚡ User ${socket.user.authId} connected`));
            // Send notifications only on initial connection
            // sendNotificationsToAllConnectedUsers(socket)
            registerEventHandlers(socket);
        }
    });
};
// Separate function to register all event handlers
const registerEventHandlers = (socket) => {
    // Disconnect handler
    socket.on('disconnect', () => {
        var _a;
        server_1.onlineUsers.delete(socket.id);
        logger_1.logger.info(colors_1.default.red(`User ${((_a = socket.user) === null || _a === void 0 ? void 0 : _a.authId) || 'Unknown'} disconnected ⚡`));
    });
};
// const sendNotificationsToAllConnectedUsers = async (socket: SocketWithUser) => {
//   try {
//     const userId = socket.user?.authId
//     if (!userId) return
//     const [notifications, unreadCount] = await Promise.all([
//       Notification.find({ receiver: userId }).populate([
//         { path: 'sender', select: 'name profile' },
//       ]).lean(),
//       Notification.countDocuments({ receiver: userId, isRead: false }),
//     ])
//     socket.emit(`notification::${userId}`, {
//       notifications,
//       unreadCount,
//     })
//   } catch (error) {
//     logger.error('Error sending notifications:', error)
//   }
// }
exports.socketHelper = {
    socket,
    // sendNotificationsToAllConnectedUsers,`
};
