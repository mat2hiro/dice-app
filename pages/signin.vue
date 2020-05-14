<template>
  <div>
    <FirebaseAuth />
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
