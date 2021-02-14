<template>
  <div class="result-header">
    <div class="container">
      <div class="board-stat">
        <div class="dice">
          {{ diceUserName }}:
          <span class="text-nowrap">
            <span
              class="border bg-white"
              :class="{ 'text-danger': !!isDouble }"
              >{{ diceValue.join(' + ') }}</span
            >
            = {{ diceValue.reduce((pre, vl) => pre + vl, 0) }}
          </span>
        </div>
        <div class="double small">Double: {{ double }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['diceUserName', 'diceValue', 'double'],
  computed: {
    isDouble() {
      return this.diceValue?.every((val) => val === this.diceValue[0])
    }
  }
})
</script>

<style lang="scss" scoped>
.result-header {
  position: absolute;
  height: 60px;
  left: 50%;
  right: 0;
  z-index: 10;
  background: #f5f5f5;
  border-bottom: 1px solid #ccc;
  max-width: 570px;
  .container {
    height: 100%;
    .board-stat {
      height: 100%;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      .dice {
        font-size: 1.2em;
        margin-right: 1em;
        .border {
          padding: 0.3em;
          border-radius: 3px;
        }
      }
      .double {
        flex-shrink: 0;
      }
    }
  }
  @media (max-width: 1199px) {
    max-width: 480px;
  }
  @media (max-width: 991px) {
    max-width: 360px;
  }
  @media (max-width: 767px) {
    max-width: unset;
    position: fixed;
    left: 0;
    // background: #f5f5f5;
    // border-bottom: 1px solid #ccc;
    .container .board-stat {
    }
  }
}
</style>
