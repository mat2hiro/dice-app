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
import crypto from 'crypto'
import Vue from 'vue'
export default Vue.extend({
  props: ['username', 'uid', 'htmlId', 'onClick'],
  computed: {
    userColor() {
      return (uid) => {
        const bg =
          '#' +
          crypto
            .createHash('md5')
            .update(uid)
            .digest('hex')
            .slice(0, 6)
        const r = parseInt(bg.substr(1, 2), 16)
        const g = parseInt(bg.substr(3, 2), 16)
        const b = parseInt(bg.substr(5, 2), 16)

        const cl = (r * 299 + g * 587 + b * 114) / 1000 < 128 ? '#fff' : '#000'
        return {
          background: bg,
          color: cl
        }
      }
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
