import Vue from 'vue'
import { GetterTree, ActionTree, MutationTree } from 'vuex'
import {
  IUser,
  IDice,
  ICard,
  IThrowUser,
  IMessage,
  FDate,
  ITime,
  IBoard,
  ICell
} from '../type'
import { CellPositions } from '../static/ts/monopoly-cells'
import firebase from '~/plugins/firebase'

const boardsRef = firebase.firestore().collection('boards')
const usersRef = firebase.firestore().collection('users')

interface IUsers<Dt> {
  [key: string]: IUser<Dt>
}

interface State<Dt> {
  id: string
  boardName: string
  owner: string
  users: IUsers<Dt>
  dice: IDice<Dt>
  card: ICard
  throwUser: IThrowUser
  unsubscribe: Function[]
  history: IDice<Dt>[]
  messages: IMessage<Dt>[]
  cells: ICell<Dt>[]
}

interface IState extends State<Date> {}
interface FState extends State<FDate> {}

export const state = (): IState => ({
  id: '',
  boardName: '',
  owner: '',
  users: {},
  dice: {
    value: [0, 0],
    uid: '',
    time: new Date()
  },
  card: { from: 0, to: 16, value: '0' },
  throwUser: { uid: '', double: 0 },
  unsubscribe: [] as Function[],
  history: [] as IDice<Date>[],
  messages: [] as IMessage<Date>[],
  cells: [] as ICell<Date>[]
})

// export type BoardModuleState = ReturnType<typeof state>

export const mutations: MutationTree<IState> = {
  unsubscribe(state, uns: Function[]) {
    state.unsubscribe.forEach((un) => un())
    state.unsubscribe = uns
  },
  init(state, id: string) {
    state.id = id
    state.boardName = ''
    state.owner = ''
    state.users = {}
    state.dice = {
      value: [0, 0],
      uid: '',
      time: new Date()
    }
    state.card = { from: 0, to: 16, value: '0' }
    state.throwUser = { uid: '', double: 0 }
    state.history = []
    state.messages = []
    state.cells = []
  },
  set(state, setState: FState) {
    state.id = setState.id || state.id
    state.boardName = setState.boardName || state.boardName
    state.owner = setState.owner || state.owner
    state.dice =
      (setState.dice && { ...setState.dice, time: new Date() }) || state.dice
    if (setState.dice.time) state.dice.time = setState.dice.time.toDate()
    state.card = setState.card || state.card
    state.throwUser = setState.throwUser || state.throwUser
  },
  setU(state, { uid, user }: { uid: string; user: IUser<FDate> }) {
    const timestamp: ITime<FDate> = user.timestamp || {}
    const ts: ITime<Date> = {}
    if (timestamp.joined) ts.joined = timestamp.joined.toDate()
    if (timestamp.left) ts.left = timestamp.left.toDate()
    if (timestamp.updated) ts.updated = timestamp.updated.toDate()
    Vue.set(state.users, uid, { ...user, timestamp: ts } as IUser<Date>)
  },
  removeU(state, uid: string) {
    Vue.delete(state.users, uid)
  },
  setM(state, message: IMessage<FDate>) {
    const timestamp: ITime<FDate> = message.timestamp || {}
    const ts: ITime<Date> = {}
    if (timestamp.created) ts.created = timestamp.created.toDate()
    state.messages.unshift({ ...message, timestamp: ts } as IMessage<Date>)
  },
  setC(state, { cell, idx }: { cell: ICell<FDate>; idx: number }) {
    const timestamp: ITime<FDate> = cell.timestamp || {}
    const ts: ITime<Date> = {}
    if (timestamp.updated) ts.updated = timestamp.updated.toDate()
    Vue.set(state.cells, idx, { ...cell, timestamp: ts } as ICell<Date>)
  },
  pushHistory(state, dice: IDice<FDate>) {
    if (dice.time.toMillis() === state.dice.time.getTime()) return
    state.history.unshift({ ...dice, time: dice.time.toDate() } as IDice<Date>)
  }
}

export const getters: GetterTree<IState, IState> = {
  joinedUsers: ({ users }): IUsers<Date> => {
    const now = new Date().getTime()
    return Object.keys(users).reduce((pre, uid) => {
      const timestamp = users[uid].timestamp || {}
      const joinedAt = timestamp.joined
      const leftAt = timestamp.left
      const updatedAt = timestamp.updated || joinedAt
      if (
        joinedAt && // joined?
        (!leftAt || joinedAt > leftAt) && // not left?
        now - updatedAt.getTime() < 2 * 60 * 60 * 1000 // not outdated?
      ) {
        pre[uid] = users[uid]
      }
      return pre
    }, {} as IUsers<Date>)
  },
  isOwner: ({ owner }) => (uid: string): boolean => owner === uid,
  nextUserId: (_, { joinedUsers }: { joinedUsers: IUsers<Date> }) => (
    uid: string
  ): string => {
    if (Object.keys(joinedUsers).length === 1) return uid
    const me = joinedUsers[uid]
    if (!me) return ''
    const meOrder = me.order === Object.keys(joinedUsers).length ? 0 : me.order
    return Object.keys(joinedUsers).reduce((pre, key) => {
      return key !== uid &&
        meOrder < joinedUsers[key].order &&
        (!pre || joinedUsers[pre].order > joinedUsers[key].order)
        ? key
        : pre
    }, '')
  },
  totalAsset: (
    { cells }: { cells: ICell<Date>[] },
    { joinedUsers }: { joinedUsers: IUsers<Date> }
  ) => (uid: string) =>
    joinedUsers[uid].cash +
      cells
        .filter((c) => c.owner === uid)
        .reduce(
          (acc, c) =>
            acc +
            (c.house < 0 ? c.price / 2 : c.price + c.buildPrice * c.house),
          0
        ) || 0
}

interface PDice {
  min: number
  max: number
  amount: number
}

export const actions: ActionTree<IState, IState> = {
  clear({ commit }, id: string) {
    commit('init', id)
  },
  reset: async ({ state, getters }, uid) => {
    const boardRef = boardsRef.doc(state.id)
    const [cells, users] = await Promise.all([
      boardRef.collection('cells').get(),
      boardRef.collection('users').get()
    ])
    const batch = firebase.firestore().batch()
    const now = new Date()
    cells.docs.forEach((doc) => {
      batch.update(doc.ref, { owner: '', house: 0 })
    })
    users.docs.forEach((doc, idx) => {
      batch.update(doc.ref, {
        auth: {
          payment: false,
          position: false,
          housing: false
        },
        cash: 1500,
        position: 0
      })
    })
    await Promise.all([
      boardRef.update({
        dice: {
          value: [],
          uid,
          time: new Date()
        },
        throwUser: { uid, double: 0 },
        'timestamp.updated': now
      }),
      batch.commit()
    ])
  },
  shuffleOrder: async ({ state, getters, dispatch }) => {
    const joined = Object.keys(getters.joinedUsers)
    const orders = [...Array(joined.length).keys()]
    for (let i = orders.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = orders[i]
      orders[i] = orders[j]
      orders[j] = t
    }
    const now = new Date()
    await Promise.all([
      ...joined.map((uid, idx) =>
        boardsRef
          .doc(state.id)
          .collection('users')
          .doc(uid)
          .update({
            'timestamp.updated': now,
            order: orders[idx] + 1
          })
      ),
      dispatch('sendMessage', {
        from: '',
        to: '',
        cash: 0,
        message: 'Order Shuffled.'
      })
    ])
  },
  goToJail: async ({ dispatch }, uid: string) => {
    await Promise.all([
      dispatch('setBoardUser', {
        uid,
        user: {
          position: CellPositions.JAIL,
          jail: 3
        }
      }),
      dispatch('sendMessage', {
        from: uid,
        message: `Go to jail.`
      })
    ])
  },
  releaseFromJail: async ({ state, dispatch }, uid: string) => {
    const user = state.users[uid]
    await Promise.all([
      dispatch('setBoardUser', {
        uid,
        user: {
          releaseCard: Math.max(user.releaseCard - 1, 0),
          jail: 0
        }
      }),
      dispatch('sendMessage', {
        from: uid,
        cash: user.releaseCard > 0 ? 0 : 50,
        message: 'Released from jail.'
      })
    ])
  },
  throwDice: async (
    { state, getters, dispatch },
    { uid, dice }: { uid: string; dice: PDice }
  ) => {
    const user = state.users[uid]
    const diceProps = dice || { min: 1, max: 6, amount: 2 }
    const diceRoll = Array(diceProps.amount)
      .fill(0)
      .map(() =>
        Math.floor(
          Math.random() * (1 + diceProps.max - diceProps.min) + diceProps.min
        )
      )
    const isDouble = diceRoll.every((val) => val === diceRoll[0])
    const isRepeat = user.jail <= 1 && state.throwUser.double < 2 && isDouble

    const promises = [
      boardsRef.doc(state.id).update({
        dice: {
          value: diceRoll,
          uid,
          time: new Date()
        },
        throwUser: {
          uid: isRepeat ? uid : getters.nextUserId(uid),
          double: isRepeat ? state.throwUser.double + 1 : 0
        }
      })
    ]
    let nextPosition = user.position
    if (isDouble && state.throwUser.double === 2) {
      promises.push(dispatch('goToJail', uid))
    } else {
      nextPosition +=
        isDouble || user.jail <= 1
          ? diceRoll.reduce((p, v) => {
              return p + v
            }, 0)
          : 0
      promises.push(
        dispatch('setBoardUser', {
          uid,
          user: {
            jail: isDouble ? 0 : Math.max(user.jail - 1, 0),
            position: nextPosition % 40
          }
        })
      )
      if (user.jail === 1) {
        promises.push(dispatch('releaseFromJail', uid))
      }
    }
    if (nextPosition >= 40) {
      promises.push(
        dispatch('sendMessage', {
          from: '',
          to: uid,
          cash: 200,
          message: 'Got salary.'
        })
      )
    }
    await Promise.all(promises)
    return diceRoll
  },
  skip: async ({ state, getters }, uid: string) => {
    const nextuid: string = getters.nextUserId(uid)
    await Promise.all([
      boardsRef.doc(state.id).update({
        throwUser: {
          uid: nextuid,
          double: 0
        }
      }),
      boardsRef
        .doc(state.id)
        .collection('users')
        .doc(uid)
        .update({ 'timestamp.updated': new Date() })
    ])
  },
  drawCard: async ({ state }, minMax: string[]) => {
    const value = (
      Math.random() * (+minMax[1] - +minMax[0]) +
      +minMax[0]
    ).toFixed(2)
    await Promise.all([
      boardsRef.doc(state.id).update({
        card: {
          from: +minMax[0],
          to: +minMax[1],
          value
        }
      })
    ])
  },
  sendMessage: async ({ state }, message: IMessage<Date>) => {
    const now = new Date()
    const messagePromises: Promise<any>[] = [
      boardsRef
        .doc(state.id)
        .collection('messages')
        .add({
          ...message,
          timestamp: { created: now }
        })
    ]
    if (message.cash !== 0) {
      if (message.from) {
        messagePromises.push(
          boardsRef
            .doc(state.id)
            .collection('users')
            .doc(message.from)
            .update({ 'timestamp.updated': now }),
          boardsRef
            .doc(state.id)
            .collection('users')
            .doc(message.from)
            .update({
              cash: state.users[message.from].cash - (message.cash || 0)
            })
        )
      }
      if (message.to) {
        messagePromises.push(
          boardsRef
            .doc(state.id)
            .collection('users')
            .doc(message.to)
            .update({
              cash: state.users[message.to].cash + (message.cash || 0)
            })
        )
      }
    }
    await Promise.all(messagePromises)
  },
  setBoard: async ({ state }, board: Partial<IBoard<Date>>) => {
    await boardsRef.doc(state.id).update({
      boardName: board.boardName,
      owner: board.owner
    })
  },
  setBoardUser: async (
    { state },
    { uid, user }: { uid: string; user: Partial<IUser<Date>> }
  ) => {
    await boardsRef
      .doc(state.id)
      .collection('users')
      .doc(uid)
      .update({
        ...user,
        'timestamp.updated': new Date()
      })
  },
  setCell: async ({ state }, { idx, cell }: { idx: number; cell: any }) => {
    await boardsRef
      .doc(state.id)
      .collection('cells')
      .doc('' + idx)
      .update({
        ...cell,
        'timestamp.updated': new Date()
      })
  },
  startListener({ state, commit }) {
    const unsubscribeThis = boardsRef.doc(state.id).onSnapshot((doc) => {
      const data: Partial<IBoard<FDate>> = doc.data() || {}
      if (data.dice) {
        commit('pushHistory', data.dice)
      }
      commit('set', {
        id: doc.id,
        boardName: data.boardName,
        owner: data.owner,
        dice: data.dice,
        card: data.card,
        throwUser: data.throwUser
      })
    })
    const unsubscribeUser = boardsRef
      .doc(state.id)
      .collection('users')
      .orderBy('order')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change: any) => {
          const user: Partial<IUser<FDate>> = change.doc.data()
          const uid: string = change.doc.id

          switch (change.type) {
            case 'added':
            case 'modified':
              commit('setU', { uid, user })
              break
            case 'removed':
              commit('removeU', uid)
              break
          }
        })
      })
    const now = new Date()
    const unsubscribeMessage = boardsRef
      .doc(state.id)
      .collection('messages')
      .orderBy('timestamp.created')
      .where('timestamp.created', '>', now)
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          const message = change.doc.data()
          commit('setM', message)
        })
      })

    const unsubscribeCell = boardsRef
      .doc(state.id)
      .collection('cells')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          const cell: Partial<ICell<FDate>> = change.doc.data()
          commit('setC', { cell, idx: change.doc.id })
        })
      })

    commit('unsubscribe', [
      unsubscribeThis,
      unsubscribeUser,
      unsubscribeMessage,
      unsubscribeCell
    ])
  },
  stopListener({ commit }) {
    commit('unsubscribe', [])
  }
}
