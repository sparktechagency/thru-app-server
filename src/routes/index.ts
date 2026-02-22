import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { PlanRoutes } from '../app/modules/plan/plan.route'
import { ActivityRoutes } from '../app/modules/activity/activity.route'
import { RequestRoutes } from '../app/modules/request/request.route'
import { FriendRoutes } from '../app/modules/friend/friend.route'
import { CommentRoutes } from '../app/modules/comment/comment.route'
import { MessageRoutes } from '../app/modules/message/message.route'
import { PostRoutes } from '../app/modules/post/post.route'
import { ReviewRoutes } from '../app/modules/review/review.route'

const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/public', route: PublicRoutes },
  { path: '/plan', route: PlanRoutes },
  { path: '/activity', route: ActivityRoutes },
  { path: '/request', route: RequestRoutes },
  { path: '/friend', route: FriendRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/message', route: MessageRoutes },
  { path: '/post', route: PostRoutes },
  { path: '/review', route: ReviewRoutes }
]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
