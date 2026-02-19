"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRoutes = void 0;
const express_1 = __importDefault(require("express"));
const request_controller_1 = require("./request.controller");
const request_validation_1 = require("./request.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.USER), request_controller_1.RequestController.getMyFreindRequestList);
router.post('/plan-add', (0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(request_validation_1.RequestValidations.createPlanRequest), request_controller_1.RequestController.sendPlanRequest);
router.patch('/plan/:id', (0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(request_validation_1.RequestValidations.update), request_controller_1.RequestController.acceptOrRejectPlanRequest);
router.post('/:requestedTo', (0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(request_validation_1.RequestValidations.create), request_controller_1.RequestController.createRequest);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.USER), (0, validateRequest_1.default)(request_validation_1.RequestValidations.update), request_controller_1.RequestController.updateRequest);
exports.RequestRoutes = router;
