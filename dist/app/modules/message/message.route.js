"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const message_validation_1 = require("./message.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const processReqBody_1 = require("../../middleware/processReqBody");
const router = express_1.default.Router();
// Individual Chat
router.post('/:friendId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(message_validation_1.MessageValidations.sendMessage), message_controller_1.MessageController.sendMessage);
router.get('/:friendId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), message_controller_1.MessageController.getMessagesByFriend);
// Plan Group Chat
router.post('/group/:planId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, validateRequest_1.default)(message_validation_1.MessageValidations.sendMessage), message_controller_1.MessageController.sendGroupMessage);
router.get('/group/:planId', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), message_controller_1.MessageController.getMessagesByPlan);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(message_validation_1.MessageValidations.updateMessage), message_controller_1.MessageController.updateMessage);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.ADMIN), message_controller_1.MessageController.deleteMessage);
exports.MessageRoutes = router;
