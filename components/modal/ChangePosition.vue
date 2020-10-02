<template>
  <b-modal id="modal-change-position" @show="init" @ok="submit" @hidden="reset">
    <form class="form-group" @submit.stop.prevent="submit">
      <div class="row align-items-center">
        <span class="col-2">
          user:
        </span>
        <div class="col-10">
          <select v-model="touid" class="form-control">
            <template v-for="(user, key) in users">
              <option v-if="key === uid || hasAuth" :key="key" :value="key">
                {{ user.username }}
              </option>
            </template>
          </select>
        </div>
      </div>
      <div class="row align-items-center">
        <span class="col-2">
          position:
        </span>
        <div class="col-10">
          <select v-model="positionIdx" class="form-control">
            <template v-for="(cell, idx) in cells">
              <option :key="idx" :value="idx">
                {{ cell.name }}
              </option>
            </template>
          </select>
        </div>
      </div>
    </form>
    <template v-slot:modal-ok>
      GO
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['users', 'defaultToUid', 'cells', 'hasAuth'],
  data: () => ({
    touid: '',
    positionIdx: '',
    isLoading: false
  }),
  computed: {
    ...mapGetters('auth', ['uid'])
  },
  methods: {
    ...mapActions('board', ['setUser']),
    init() {
      this.reset()
      this.touid = this.defaultToUid
      this.positionIdx = this.users?.[this.defaultToUid]?.position || 0
    },
    reset() {
      this.touid = ''
      this.positionIdx = ''
    },
    async submit(ev) {
      ev.preventDefault()
      if (this.isLoading) return
      this.isLoading = true
      await this.setUser({
        uid: this.touid,
        user: { position: +this.positionIdx }
      }).catch(console.error)
      this.isLoading = false
      this.$bvModal.hide('modal-change-position')
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
