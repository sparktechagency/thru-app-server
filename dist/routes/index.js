"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("../app/modules/user/user.route");
const auth_route_1 = require("../app/modules/auth/auth.route");
const express_1 = __importDefault(require("express"));
const notifications_route_1 = require("../app/modules/notifications/notifications.route");
const public_route_1 = require("../app/modules/public/public.route");
const plan_route_1 = require("../app/modules/plan/plan.route");
const activity_route_1 = require("../app/modules/activity/activity.route");
const request_route_1 = require("../app/modules/request/request.route");
const friend_route_1 = require("../app/modules/friend/friend.route");
const comment_route_1 = require("../app/modules/comment/comment.route");
const message_route_1 = require("../app/modules/message/message.route");
const post_route_1 = require("../app/modules/post/post.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: '/user', route: user_route_1.UserRoutes },
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/notifications', route: notifications_route_1.NotificationRoutes },
    { path: '/public', route: public_route_1.PublicRoutes },
    { path: '/plan', route: plan_route_1.PlanRoutes },
    { path: '/activity', route: activity_route_1.ActivityRoutes },
    { path: '/request', route: request_route_1.RequestRoutes },
    { path: '/friend', route: friend_route_1.FriendRoutes },
    { path: '/comments', route: comment_route_1.CommentRoutes },
    { path: '/message', route: message_route_1.MessageRoutes },
    { path: '/post', route: post_route_1.PostRoutes }
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
