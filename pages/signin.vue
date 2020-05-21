<template>
  <div>
    <div v-show="!isLoginSuccess">
      <p class="text-center">sign-in.</p>
      <FirebaseAuth @firebasepopup="toggleLoginForm" />
    </div>
    <div v-show="isLoginSuccess">
      <div class="loader"></div>
      <p class="text-center">prease wait...</p>
    </div>
    <p class="text-center">
      <nuxt-link to="/terms/privacy">Privacy Policy</nuxt-link>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import FirebaseAuth from '~/components/firebase/Auth.vue'

export default Vue.extend({
  layout: 'beforeAuth',
  components: {
    FirebaseAuth
  },
  data() {
    return {
      isLoginSuccess: false
    }
  },
  methods: {
    toggleLoginForm(loggingin) {
      this.isLoginSuccess = loggingin
    }
  }
})
</script>

<style lang="scss" scoped></style>
