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
  async gotUser({ commit }: any, user: any) {
    const uSnap = await firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .get()
    if (uSnap.exists) {
      console.log(uSnap.data())
      commit('setUser', { ...user, displayName: uSnap.data().username })
    } else {
      commit('setUser', { ...user })
    }
  },
  signout({ commit }: any) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        commit('signout')
      })
  },
  updateUserName({ commit }: any, { uid, userName }) {
    firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .update({ username: userName })
    commit('updateUserName', userName)
  }
}

export const mutations = {
  setUser(state: IState, user: any) {
    state.status = 'loggedIn'
    state.uid = user.uid
    state.username = user.displayName
  },
  updateUserName(state: IState, userName: string) {
    state.username = userName
  },
  signout(state: IState) {
    state.status = 'loggedOut'
    state.uid = ''
    state.username = ''
  }
}
