<template>
  <div>
    <p class="text-center">sign-in.</p>
    <FirebaseAuth />
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
  }
})
</script>

<style lang="scss" scoped></style>
