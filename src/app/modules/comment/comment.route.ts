import express from 'express';
import { CommentController } from './comment.controller';
import { CommentValidations } from './comment.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(CommentValidations.create),
    CommentController.addComment
);

router.get('/:postId', CommentController.getCommentsByPostId);

export const CommentRoutes = router;
