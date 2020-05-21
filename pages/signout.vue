<template>
  <div></div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  mounted() {
    this.signout()
  },
  methods: {
    ...mapActions('auth', ['signout'])
  }
})
</script>
