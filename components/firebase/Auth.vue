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
            this.$router.push('/')
          }
        },
        signInFlow: 'popup'
      }

      ui.start('#firebaseui-auth-container', config)
    }
  }
}
</script>
