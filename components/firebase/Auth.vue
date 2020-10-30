<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script lang="ts">
// import firebaseui from 'firebaseui'
import firebase from '~/plugins/firebase'

export default {
  name: 'FirebaseAuth',
  mounted() {
    const auth = firebase.auth()
    const db = firebase.firestore()
    if (process.browser) {
      const firebaseui = require('firebaseui')
      const ui =
        firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth)

      const config = {
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        callbacks: {
          signInSuccessWithAuthResult: (authResult: any) => {
            this.$emit('firebasepopup', true)
            const user = authResult.user
            if (authResult.additionalUserInfo.isNewUser) {
              db.collection('users')
                .doc(user.uid)
                .set({
                  timestamp: {
                    created: new Date()
                  },
                  username: user.displayName
                })
            }
            this.$router.push('/')
          },
          signInFailure: () => {
            this.$emit('firebasepopup', false)
          },
          uiShown: () => {
            this.$emit('firebasepopup', false)
          }
        },
        signInFlow: 'redirect'
      }

      ui.start('#firebaseui-auth-container', config)
    }
  }
}
</script>
