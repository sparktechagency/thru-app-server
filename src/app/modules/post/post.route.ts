import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { PostControllers } from './post.controller';
import { PostValidations } from './post.validation';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(PostValidations.create),
    PostControllers.createPost
);

router.get('/', auth(USER_ROLES.USER, USER_ROLES.ADMIN), PostControllers.getAllPosts);

router.get('/my-posts', auth(USER_ROLES.USER), PostControllers.getMyPosts);

router.get('/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN), PostControllers.getPostById);

router.patch(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(PostValidations.update),
    PostControllers.updatePost
);

router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    PostControllers.deletePost
);

export const PostRoutes = router;
