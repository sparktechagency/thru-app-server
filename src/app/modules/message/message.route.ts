import express from 'express';
import { MessageController } from './message.controller';
import { MessageValidations } from './message.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = express.Router();

// Send a message to a friend
router.post(
    '/:friendId',
    auth(USER_ROLES.USER),
    validateRequest(MessageValidations.sendMessage),
    MessageController.sendMessage
);

// Get all messages with a friend
router.get(
    '/:friendId',
    auth(USER_ROLES.USER),
    MessageController.getMessagesByFriend
);

export const MessageRoutes = router;
