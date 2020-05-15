import { GetterTree, ActionTree, MutationTree } from 'vuex'
import firebase from '~/plugins/firebase'

const boardsRef = firebase.firestore().collection('boards')

export const state = () => ({
  owner: '',
  users: [] as any[],
  dice: { value: [0, 0], user: { uid: '', username: '' } },
  throwUser: { uid: '', username: '', double: 0 },
  unsubscribe: [] as any[]
})

export type BoardModuleState = ReturnType<typeof state>

export const mutations: MutationTree<BoardModuleState> = {
  unsubscribe(state, uns) {
    state.unsubscribe.forEach((un) => un())
    state.unsubscribe = uns
  },
  init(state, owner) {
    state.owner = owner
    state.users = []
    state.dice = { value: [0, 0], user: { uid: '', username: '' } }
    state.throwUser = { uid: '', username: '', double: 0 }
  },
  set(state, setState) {
    state.owner = setState.owner || state.owner
    state.users =
      (setState.users && setState.users.filter((u: any) => u.is_joined)) ||
      state.users
    state.dice = setState.dice || state.dice
    state.throwUser = setState.throwUser || state.throwUser
  },
  addU(state, user) {
    state.users.push(user)
  },
  setU(state, user) {
    const index = state.users.findIndex((u) => u.uid === user.uid)
    if (index >= 0) {
      state.users[index] = user
    } else {
      state.users.push(user)
    }
  },
  removeU(state, user) {
    const index = state.users.findIndex((u) => u.uid === user.uid)
    if (index >= 0) {
      state.users.splice(index, 1)
    }
  }
}

export const getters: GetterTree<BoardModuleState, BoardModuleState> = {
  users(state) {
    return state.users.filter((user) => user.is_joined)
  },
  board(state) {
    return state
  }
}

export const actions: ActionTree<BoardModuleState, BoardModuleState> = {
  clear({ commit }) {
    commit('init', '')
  },
  startListener({ commit }, nowId) {
    const unsubscribeThis = boardsRef.doc(nowId).onSnapshot((doc) => {
      const data = doc.data()
      commit('set', {
        owner: data && data.owner,
        dice: data && data.dice,
        throwUser: data && data.throwUser
      })
    })
    const unsubscribeUser = boardsRef
      .doc(nowId)
      .collection('users')
      .orderBy('order')
      .onSnapshot((snap) => {
        snap.docChanges().forEach((change: any) => {
          const user = change.doc.data()
          user.uid = change.doc.id

          switch (change.type) {
            case 'added':
              user.is_joined && commit('addU', user)
              break
            case 'modified':
              user.is_joined ? commit('setU', user) : commit('removeU', user)
              break
            case 'removed':
              commit('removeU', user)
              break
          }
        })
      })

    commit('unsubscribe', [unsubscribeThis, unsubscribeUser])
  },
  stopListener({ commit }) {
    commit('unsubscribe', [])
  }
}
