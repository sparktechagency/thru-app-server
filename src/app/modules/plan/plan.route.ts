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
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PlanController.getAllPlans
);

router.get(
  '/history',
  auth(USER_ROLES.USER),
  PlanController.getHistoryPlans
);

router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PlanController.getSinglePlan
);

router.post(
  '/',
  auth(USER_ROLES.USER),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.create),
  PlanController.createPlan
);

router.patch(
  '/:id',
  auth(USER_ROLES.USER),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.update),
  PlanController.updatePlan
);

router.delete(
  '/:id',
  auth(USER_ROLES.USER),
  PlanController.deletePlan
);

router.post(
  '/add-collaborator',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PlanValidations.addCollaborator),
  PlanController.addPlanCollaborator
);

router.post(
  '/remove-collaborator',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PlanValidations.removeCollaborator),
  PlanController.removePlanCollaborator
);

export const PlanRoutes = router;