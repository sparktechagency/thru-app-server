import express from 'express';
import { RequestController } from './request.controller';
import { RequestValidations } from './request.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();



router.get(
  '/',
  auth(

    USER_ROLES.USER
  ),
  RequestController.getMyFreindRequestList
);

router.get(
  '/friends',
  auth(
    USER_ROLES.USER
  ),
  RequestController.getMyFriendList
);

router.post(
  '/',
  auth(

    USER_ROLES.USER
  ),

  validateRequest(RequestValidations.create),
  RequestController.createRequest
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.USER
  ),

  validateRequest(RequestValidations.update),
  RequestController.updateRequest
);

router.post(
  '/plan',
  auth(USER_ROLES.USER),
  validateRequest(RequestValidations.createPlanRequest),
  RequestController.sendPlanRequest
);

router.patch(
  '/plan/:id',
  auth(USER_ROLES.USER),
  validateRequest(RequestValidations.update),
  RequestController.acceptOrRejectPlanRequest
);


export const RequestRoutes = router;