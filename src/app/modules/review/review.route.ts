import express from 'express'
import { ReviewController } from './review.controller'
import validateRequest from '../../middleware/validateRequest'
import { ReviewValidationSchema } from './review.validation'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  validateRequest(ReviewValidationSchema),
  auth(USER_ROLES.USER),
  ReviewController.createReview,
)

router.get('/', ReviewController.getAllReviews)
router.get('/:id',auth(USER_ROLES.USER,USER_ROLES.ADMIN), ReviewController.getSingleReview)
router.delete('/:id',auth(USER_ROLES.USER,USER_ROLES.ADMIN), ReviewController.deleteReview)


export const ReviewRoutes = router
