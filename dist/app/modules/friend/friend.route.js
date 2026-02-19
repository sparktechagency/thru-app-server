"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const friend_controller_1 = require("./friend.controller");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.USER), friend_controller_1.FriendController.getMyFriendList);
exports.FriendRoutes = router;
