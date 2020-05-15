import firebase from '~/plugins/firebase'

const auth = firebase.auth()

export default function({ route, store, redirect }: any) {
  auth.onAuthStateChanged((user) => {
    console.log(route.name)
    if (user) {
      store.dispatch('auth/gotUser', user)
    } else if (route.name !== 'signin' && !route.name.startsWith('terms'))
      redirect('/signin')
  })
}
