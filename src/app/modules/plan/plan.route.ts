import express from 'express';
import { PlanController } from './plan.controller';
import { PlanValidations } from './plan.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

router.get(
  '/',
  auth(

    USER_ROLES.ADMIN
  ),
  PlanController.getAllPlans
);

router.get(
  '/:id',
  auth(

    USER_ROLES.ADMIN
  ),
  PlanController.getSinglePlan
);

router.post(
  '/',
  auth(

    USER_ROLES.ADMIN
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.create),
  PlanController.createPlan
);

router.patch(
  '/:id',
  auth(

    USER_ROLES.ADMIN
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.update),
  PlanController.updatePlan
);

router.delete(
  '/:id',
  auth(

    USER_ROLES.ADMIN
  ),
  PlanController.deletePlan
);

export const PlanRoutes = router;