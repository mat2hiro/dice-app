export interface IUser {
  uid: string
  username: string
}

export interface IDice {
  value: number[]
  user: IUser
  time: Date
}
