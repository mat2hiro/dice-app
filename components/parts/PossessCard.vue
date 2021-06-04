<template>
  <div class="possess-card" :class="borderClass">
    <span v-if="card.owner" class="own-icon" :style="bgStyle"></span>
    {{ card.title }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { uidColor } from '~/services'

export default Vue.extend({
  props: ['card', 'isRecent'],
  computed: {
    bgStyle() {
      return {
        background: uidColor(this.$props.card?.owner || '')
      }
    },
    borderClass() {
      return this.$props.isRecent
        ? 'recent'
        : this.$props.card?.owner
        ? 'drawn'
        : ''
    }
  }
})
</script>

<style lang="scss" scoped>
.possess-card {
  position: relative;
  overflow-x: scroll;
  white-space: nowrap;
  padding: 10px 0.5em;
  border-bottom: 1px solid #ccc;
  &.recent {
    border: 1px solid red;
    margin: -1px -1px 0;
  }
}
.own-icon {
  position: absolute;
  border: 0.5px solid #ccc;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
}
</style>
