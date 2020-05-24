export interface FDate {
  toDate: () => Date
  toMillis: () => number
}

export interface ITime<Dt> {
  [key: string]: Dt
}

export interface IUser<Dt> {
  username: string
  cash: number
  order: number
  position: number
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

export interface ICard {
  from: number
  to: number
  value: string
}

export interface IBoard<Dt> {
  boardId: string
  card: ICard
  dice: IDice<Dt>
  isActive: boolean
  owner: string
  throwUser: IThrowUser
  timestamp: ITime<Dt>
}

export interface IMessage<Dt> {
  cash: number
  from: string
  to: string
  message: string
  timestamp: ITime<Dt>
}
