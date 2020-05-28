<template>
  <div>
    <div class="card-result">
      <p>{{ card.from }} ~ {{ card.to }} : {{ card.value }}</p>
    </div>
    <div v-if="isYourTime" class="row align-items-center justify-content-end">
      <div
        class="form-group col-12 d-flex align-items-center justify-content-end"
      >
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
  props: ['card', 'isYourTime'],
  data: () => ({
    randVal: [0, 16]
  }),
  methods: {
    ...mapActions('board', ['drawCard'])
  }
})
</script>

<style lang="scss" scoped>
.card-result {
  margin-bottom: 1em;
}
</style>
