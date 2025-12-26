import express from 'express';
import { ActivityController } from './activity.controller';
import { ActivityValidations } from './activity.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();



router.post(
  '/',
  auth(
    USER_ROLES.USER,

    USER_ROLES.ADMIN
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ActivityValidations.create),
  ActivityController.createActivity
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.USER,

    USER_ROLES.ADMIN
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ActivityValidations.update),
  ActivityController.updateActivity
);

router.delete(
  '/:id',
  auth(
    USER_ROLES.USER,

    USER_ROLES.ADMIN
  ),
  ActivityController.deleteActivity
);

export const ActivityRoutes = router;