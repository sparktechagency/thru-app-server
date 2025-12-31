import { HydratedDocument, Model, Types } from 'mongoose'

type IAuthentication = {
  isRestricted: boolean
  restrictionLeftAt: Date | null
  wrongLoginAttempts: number | 0
  passwordChangedAt?: Date | null
}

export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface IUser {
  _id: Types.ObjectId
  name?: string
  lastName?: string
  bio: string
  email: string
  profile?: string
  cover?: string
  phone?: string
  status: string
  verified: boolean
  address?: string
  location: Point
  password: string
  totalDays?: string

  role: string
  isFriend?: boolean
  appId?: string
  fcmToken?: string
  authentication: IAuthentication
  createdAt: Date
  updatedAt: Date
}

export type UserModel = {
  isPasswordMatched: (
    givenPassword: string,
    savedPassword: string,
  ) => Promise<boolean>
} & Model<IUser>

export type UserDocument = HydratedDocument<IUser>


export type IUserFilterableFields = {
  searchTerm?: string
  role?: string
  status?: string
  verified?: boolean
  radius?: number
  latitude?: number
  longitude?: number
  address?: string
}
