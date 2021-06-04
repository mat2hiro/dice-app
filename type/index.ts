export interface FDate {
  toDate: () => Date
  toMillis: () => number
}

export interface ITime<Dt> {
  [key: string]: Dt
}

interface IAuth {
  payment: boolean
  position: boolean
  housing: boolean
}

export interface IUser<Dt> {
  username: string
  cash: number
  order: number
  position: number
  color: string
  jail: number
  releaseCard: number
  auth: IAuth
  timestamp: ITime<Dt>
}

export interface IDice<Dt> {
  value: number[]
  uid: string
  time: Dt
}

export interface IThrowUser {
  double: number
  uid: string
}

export interface IBoard<Dt> {
  boardName: string
  dice: IDice<Dt>
  isActive: boolean
  owner: string
  throwUser: IThrowUser
  drawIdx: IDrawIdx
  timestamp: ITime<Dt>
}

export interface IMessage<Dt> {
  cash: number
  from: string
  to: string
  message: string
  timestamp: ITime<Dt>
}

export interface ICell<Dt> {
  owner: string
  house: number
  type: number
  price?: number
  buildPrice?: number
  timestamp: ITime<Dt>
}

export interface ICard<Dt> {
  owner: string
  type: number
  title: string
  from?: string
  to?: string
  cash?: number
  house?: number
  hotel?: number
  cell?: number
  by?: number
  infra?: number
  timestamp: ITime<Dt>
}

export interface IDrawIdx {
  communityChest?: number
  chance?: number
}
