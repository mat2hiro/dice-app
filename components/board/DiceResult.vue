<template>
  <div class="result-header">
    <div class="container">
      <div class="board-stat">
        <div class="dice">
          <p>
            {{ diceUserName }}:
            <span
              class="border bg-white"
              :class="{ 'text-danger': !!double }"
              >{{ diceValue.join(' + ') }}</span
            >
            = {{ diceValue.reduce((pre, vl) => pre + vl, 0) }}
          </p>
        </div>
        <div class="double">
          <p>Double: {{ double }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  props: ['diceUserName', 'diceValue', 'double']
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
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      .dice {
        margin-right: 1em;
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
