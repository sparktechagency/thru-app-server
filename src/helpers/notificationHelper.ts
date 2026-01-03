import { Types } from 'mongoose'
import { Notification } from '../app/modules/notifications/notifications.model'
import { logger } from '../shared/logger'
import { socket } from '../utils/socket'
import { sendPushNotification } from './pushnotificationHelper'
import { emitEvent } from './socketInstances'

export const sendNotification = async (
  from: {
    authId: string,
    profile?: string,
    name?: string,
  },
  to: string,

  title: string,
  body: string,
  friendRequestId?: string,
  planJoiningRequestId?: string,
  fcmToken?: string,
) => {
  try {



    const result = await Notification.create({
      from: from.authId,
      to,
      title,
      body,
      friendRequestId,
      planJoiningRequestId,
      isRead: false,
    })

    if (!result) logger.warn('Notification not sent')

    const socketResponse = {
      _id: result._id,
      from: {
        _id: from.authId,
        name: from?.name,
        profile: from?.profile,
      },
      to,
      title,
      body,
      friendRequestId: friendRequestId,
      planJoiningRequestId: planJoiningRequestId,
      isRead: false,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,

    }


    emitEvent(`notification::${to}`, socketResponse)

    if (fcmToken) {
      await sendPushNotification(fcmToken, title, body, { from: from.authId, to })
    }
  } catch (err) {
    //@ts-ignore
    logger.error(err, 'FROM NOTIFICATION HELPER')
  }
}
