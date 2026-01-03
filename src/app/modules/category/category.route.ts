import express from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidations } from './category.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

router.get(
  '/',
  auth(
    USER_ROLES.GUEST
  ),
  CategoryController.getAllCategorys
);


router.post(
  '/',
  auth(
    USER_ROLES.GUEST
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(CategoryValidations.createCategoryZodSchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.GUEST
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(CategoryValidations.updateCategoryZodSchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  auth(
    USER_ROLES.GUEST
  ),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;