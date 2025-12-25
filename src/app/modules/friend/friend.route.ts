import express from 'express';

import { FriendValidations } from './friend.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { RequestController } from '../request/request.controller';


const router = express.Router();

router.get(
  '/',
  auth(
    USER_ROLES.USER
  ),
  RequestController.getMyFriendList
);
export const FriendRoutes = router;