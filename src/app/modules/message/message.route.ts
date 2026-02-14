import express from 'express';
import { MessageController } from './message.controller';
import { MessageValidations } from './message.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

// Individual Chat
router.post(
    '/:friendId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(MessageValidations.sendMessage),
    MessageController.sendMessage
);

router.get(
    '/:friendId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    MessageController.getMessagesByFriend
);

// Plan Group Chat
router.post(
    '/group/:planId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(MessageValidations.sendMessage),
    MessageController.sendGroupMessage
);

router.get(
    '/group/:planId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    MessageController.getMessagesByPlan
);

router.patch(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(MessageValidations.updateMessage),
    MessageController.updateMessage
);

router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    MessageController.deleteMessage
);

export const MessageRoutes = router;
