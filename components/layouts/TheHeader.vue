<template>
  <header>
    <h1><nuxt-link to="/">mnpl app</nuxt-link></h1>
    <HamburgerNav />
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import HamburgerNav from '~/components/HamburgerNav.vue'

export default Vue.extend({
  components: {
    HamburgerNav
  }
})
</script>

<style lang="scss" scoped>
header {
  position: fixed;
  top: 0;
  height: 60px;
  width: 100%;
  padding: 0 2rem;
  background: #fff;
  border-bottom: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  h1 {
    line-height: 60px;
    font-size: 2em;
    margin: 0;
    a {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
