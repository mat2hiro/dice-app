import firebase from '~/plugins/firebase'

interface IState {
  status: string
  uid: string
  username: string
}

export const state = () => ({
  status: '',
  uid: '',
  username: ''
})

export const getters = {
  isLoggedIn: (state: IState) => state.status === 'loggedIn',
  uid: (state: IState) => state.uid,
  username: (state: IState) => state.username
}

export const actions = {
  gotUser({ commit }: any, user: any) {
    commit('setUser', user)
  },
  signout({ commit }: any) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        commit('signout')
      })
  }
}

export const mutations = {
  setUser(state: IState, user: any) {
    state.status = 'loggedIn'
    state.uid = user.uid
    state.username = user.displayName
  },
  signout(state: IState) {
    state.status = 'loggedOut'
    state.uid = ''
    state.username = ''
  }
}
