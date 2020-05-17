import Vue from 'vue'
import { GetterTree, ActionTree, MutationTree } from 'vuex'
import firebase from '~/plugins/firebase'

const boardsRef = firebase.firestore().collection('boards')

export const state = () => ({
  id: '',
  owner: '',
  users: {},
  dice: {
    value: [0, 0],
    uid: '',
    time: new Date()
  },
  card: { from: 0, to: 16, value: 0 },
  throwUser: { uid: '', double: 0 },
  unsubscribe: [] as any[],
  history: [] as any[],
  messages: [] as any[]
})

export type BoardModuleState = ReturnType<typeof state>

export const mutations: MutationTree<BoardModuleState> = {
  unsubscribe(state, uns) {
    state.unsubscribe.forEach((un) => un())
    state.unsubscribe = uns
  },
  init(state, id) {
    state.id = id
    state.owner = ''
    state.users = {}
    state.dice = {
      value: [0, 0],
      uid: '',
      time: new Date()
    }
    state.card = { from: 0, to: 16, value: 0 }
    state.throwUser = { uid: '', double: 0 }
    state.history = []
    state.messages = []
  },
  set(state, setState) {
    state.id = setState.id || state.id
    state.owner = setState.owner || state.owner
    state.users = setState.users || state.users
    state.dice = setState.dice || state.dice
    if (setState.dice.time.toDate) state.dice.time = setState.dice.time.toDate()
    state.card = setState.card || state.card
    state.throwUser = setState.throwUser || state.throwUser
  },
  setU(state, payload) {
    Vue.set(state.users, payload.uid, payload.user)
  },
  removeU(state, uid) {
    Vue.delete(state.users, uid)
  },
  setM(state, message) {
    message.time = message.time.toDate()
    state.messages.unshift(message)
  },
  pushHistory(state, dice) {
    if (dice.time.toMillis() === state.dice.time.getTime()) return
    dice.time = dice.time.toDate()
    state.history.unshift(dice)
  }
}

export const getters: GetterTree<BoardModuleState, BoardModuleState> = {
  joinedUsers: ({ users }) => {
    return Object.keys(users).reduce((pre, uid) => {
      if (users[uid].is_joined) pre[uid] = users[uid]
      return pre
    }, {})
  },
  isOwner: (state) => (uid) => state.owner === uid,
  nextUserId: ({ users }, { joinedUsers }) => (uid) => {
    if (Object.keys(joinedUsers).length === 1) return uid
    const me = joinedUsers[uid]
    if (!me) return false
    const meOrder = me.order === Object.keys(joinedUsers).length ? 0 : me.order
    return Object.keys(joinedUsers).reduce(
      (pre, key) =>
        key !== uid &&
        (!pre ||
          (meOrder < joinedUsers[key].order &&
            joinedUsers[pre].order > joinedUsers[key].order))
          ? key
          : pre,
      ''
    )
  }
}

export const actions: ActionTree<BoardModuleState, BoardModuleState> = {
  clear({ commit }, id) {
    commit('init', id)
  },
  throwDice: async ({ state, commit, getters }, payload) => {
    const { uid, dice } = payload
    const diceProps = dice || { min: 1, max: 6, amount: 2 }
    const diceRoll = Array(diceProps.amount)
      .fill(0)
      .map(() =>
        Math.floor(
          Math.random() * (1 + diceProps.max - diceProps.min) + diceProps.min
        )
      )
    const isDouble = diceRoll.every((val) => val === diceRoll[0])
    const nextuid = isDouble ? uid : getters.nextUserId(uid)
    await boardsRef.doc(state.id).update({
      dice: {
        value: diceRoll,
        uid,
        time: new Date()
      },
      throwUser: {
        uid: nextuid,
        double: isDouble ? state.throwUser.double + 1 : 0
      }
    })
  },
  skip: async ({ state, getters }, uid) => {
    const nextuid = getters.nextUserId(uid)
    await boardsRef.doc(state.id).update({
      throwUser: {
        uid: nextuid,
        double: 0
      }
    })
  },
  drawCard: async ({ state }, minMax) => {
    const value = (
      Math.random() * (+minMax[1] - +minMax[0]) +
      +minMax[0]
    ).toFixed(2)
    await boardsRef.doc(state.id).update({
      card: {
        from: +minMax[0],
        to: +minMax[1],
        value
      }
    })
  },
  sendMessage: async ({ state }, message) => {
    const messagePromises: Promise<any>[] = [
      boardsRef
        .doc(state.id)
        .collection('messages')
        .add(message)
    ]
    if (message.cash !== 0) {
      if (message.from)
        messagePromises.push(
          boardsRef
            .doc(state.id)
            .collection('users')
            .doc(message.from)
            .update({
              cash: state.users[message.from].cash - message.cash
            })
        )
      if (message.to)
        messagePromises.push(
          boardsRef
            .doc(state.id)
            .collection('users')
            .doc(message.to)
            .update({
              cash: state.users[message.to].cash + message.cash
            })
        )
    }
    await Promise.all(messagePromises)
  },
  setBoard: async ({ state }, board) => {
    await boardsRef.doc(state.id).update({
      board_id: board.board_id,
      owner: board.owner
    })
  },
  setUser: async ({ state }, payload) => {
    await boardsRef
      .doc(state.id)
      .collection('users')
      .doc(payload.uid)
      .update(payload.user)
  },
  startListener({ state, commit }) {
    const unsubscribeThis = boardsRef.doc(state.id).onSnapshot((doc) => {
      const data = doc.data()
      if (data && data.dice) {
        commit('pushHistory', data.dice)
      }
      commit('set', {
        board_id: data && data.board_id,
        owner: data && data.owner,
        dice: data && data.dice,
        card: data && data.card,
        throwUser: data && data.throwUser
      })
    })
    const unsubscribeUser = boardsRef
      .doc(state.id)
      .collection('users')
      .orderBy('order')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change: any) => {
          const user = change.doc.data()
          const uid = change.doc.id

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
      .where('time', '>', now)
      .orderBy('time')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          const message = change.doc.data()
          commit('setM', message)
        })
      })

    commit('unsubscribe', [
      unsubscribeThis,
      unsubscribeUser,
      unsubscribeMessage
    ])
  },
  stopListener({ commit }) {
    commit('unsubscribe', [])
  }
}
