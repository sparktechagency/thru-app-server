import express from 'express';
import { PlanController } from './plan.controller';
import { PlanValidations } from './plan.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

// get all plans
router.get(
  '/',
   auth(
    USER_ROLES.USER
  ),
  PlanController.getAllPlansFromDb
)



//* get all plans for the requested user
router.get(
  '/userPlans',
  auth(
    USER_ROLES.USER
  ),
  PlanController.getAllPlans
);

router.get(
  '/happening-now',
  auth(USER_ROLES.USER),
  PlanController.getPlansByStartTime
);

router.get(
  '/search',
  // auth(USER_ROLES.USER),
  validateRequest(PlanValidations.search),
  PlanController.searchPlaces
);

router.get(
  '/:id',
  auth(
    USER_ROLES.USER
  ),
  PlanController.getSinglePlan
);

router.post(
  '/',
  auth(

    USER_ROLES.USER
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.create),
  PlanController.createPlan
);

router.patch(
  '/:id',
  auth(

    USER_ROLES.USER
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(PlanValidations.update),
  PlanController.updatePlan
);

router.delete(
  '/:id',
  auth(

    USER_ROLES.USER
  ),
  PlanController.deletePlan
);

router.post(
  '/remove-friend',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PlanValidations.removeFriend),
  PlanController.removePlanFriend
);

export const PlanRoutes = router;