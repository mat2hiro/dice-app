<template>
  <div class="form-group">
    <div class="row align-items-center board-stat">
      <div class="col-12">
        <p class="dice">
          {{ diceUserName }}:
          <span class="border" :class="{ 'text-danger': !!double }">{{
            diceValue.join(' + ')
          }}</span>
          = {{ diceValue.reduce((pre, vl) => pre + vl, 0) }}
        </p>
      </div>
      <div class="col-12">
        <p class="double">Double count: {{ double }}</p>
      </div>
      <div class="col-12">
        <p>{{ card.from }} ~ {{ card.to }} : {{ card.value }}</p>
      </div>
    </div>
    <div v-if="isYourTime" class="row align-items-center justify-content-end">
      <div class="col-12 d-flex align-items-center">
        <p>Now It's Your Turn!</p>
      </div>
      <div class="col-12 d-flex align-items-center justify-content-end">
        <input v-model="randVal[0]" class="form-control" /> ~
        <input v-model="randVal[1]" class="form-control" />
        <button
          type="button"
          class="btn btn-secondary flex-shrink-0 separated"
          @click="drawCard(randVal)"
        >
          Generate Random
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  props: ['diceUserName', 'diceValue', 'double', 'card', 'isYourTime'],
  data: () => ({
    randVal: [0, 16]
  }),
  methods: {
    ...mapActions('board', ['drawCard'])
  }
})
</script>

<style lang="scss" scoped></style>
