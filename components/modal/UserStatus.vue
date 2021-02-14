<template>
  <b-modal id="modal-user-status" @show="init" @ok="submit" @hidden="reset">
    <form class="form-group" @submit.stop.prevent="submit">
      <div class="row align-items-center">
        <p class="col-12">{{ user && user.username }}</p>
      </div>
      <div class="row align-items-center">
        <span class="col-6">Total Assets:</span>
        <p class="col-6">${{ toUid && totalAsset(toUid) }}</p>
      </div>
      <div class="row align-items-center">
        <span class="col-6">Release cards:</span>
        <div class="input-group text-center col-6">
          <div class="input-group-prepend">
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="(!hasAuth && !auth.payment) || releaseCard <= 0"
              @click="releaseCard = Math.max(0, releaseCard - 1)"
            >
              -
            </button>
          </div>
          <div class="form-control">{{ releaseCard }}</div>
          <div class="input-group-append">
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="(!hasAuth && !auth.payment) || releaseCard >= 2"
              @click="releaseCard = Math.min(2, releaseCard + 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div class="row align-items-center">
        <div class="col-4">
          <label class="form-check">
            <input
              v-model="auth.payment"
              type="checkbox"
              class="form-check-input position-static"
              :disabled="!hasAuth"
            />
            Payment
          </label>
        </div>
        <div class="col-4">
          <label class="form-check">
            <input
              v-model="auth.position"
              type="checkbox"
              class="form-check-input position-static"
              :disabled="!hasAuth"
            />
            Position
          </label>
        </div>
        <div class="col-4">
          <label class="form-check">
            <input
              v-model="auth.housing"
              type="checkbox"
              class="form-check-input position-static"
              :disabled="!hasAuth"
            />
            Housing
          </label>
        </div>
      </div>
    </form>
    <template v-slot:modal-ok>
      Update
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['user', 'toUid', 'hasAuth'],
  data: () => ({
    auth: {
      payment: false,
      position: false,
      housing: false
    },
    releaseCard: 0,
    isLoading: false
  }),
  computed: mapGetters('board', ['totalAsset']),
  methods: {
    ...mapActions('board', ['setBoardUser']),
    init() {
      this.reset()
      this.auth = JSON.parse(JSON.stringify(this.user.auth))
      this.releaseCard = this.user.releaseCard || 0
    },
    reset() {
      this.auth = {
        payment: false,
        position: false
      }
    },
    async submit(ev) {
      ev.preventDefault()
      if (this.isLoading) return
      this.isLoading = true
      await this.setBoardUser({
        uid: this.toUid,
        user: {
          auth: this.auth,
          releaseCard: this.releaseCard
        }
      }).catch(console.error)
      this.isLoading = false
      this.$bvModal.hide('modal-user-status')
    }
  }
})
</script>

<style lang="scss" scoped>
.form-group {
  .row {
    margin-bottom: 1em;
    :last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
