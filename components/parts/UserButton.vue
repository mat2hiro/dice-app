<template>
  <button
    :id="htmlId"
    class="user-icon"
    type="button"
    :style="userColor(uid)"
    @click="onClick"
  >
    {{ username ? username[0] : '' }}
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

import { userColor } from '~/services'

export default Vue.extend({
  props: ['username', 'uid', 'htmlId', 'onClick'],
  computed: {
    userColor() {
      return userColor
    }
  }
})
</script>

<style lang="scss" scoped>
.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-right: 10px;
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  border-radius: 50%;
  overflow: hidden;
  &:last-of-type {
    margin-right: 0;
  }
}
</style>
