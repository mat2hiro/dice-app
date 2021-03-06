<template>
  <b-modal id="modal-send-message" @show="init" @ok="submit" @hidden="reset">
    <form class="form-group" @submit.stop.prevent="submit">
      <div class="row align-items-center">
        <span class="col-2">
          from:
        </span>
        <div class="col-10">
          <select v-model="fromuid" class="form-control">
            <option v-if="hasAuth" value="bank">
              Bank
            </option>
            <template v-for="(user, key) in users">
              <option v-if="key === uid || hasAuth" :key="key" :value="key">
                {{ user.username }}
              </option>
            </template>
          </select>
        </div>
      </div>
      <div class="row align-items-center">
        <span class="col-2">to:</span>
        <div class="col-10">
          <select v-model="touid" class="form-control">
            <option value="bank">
              Bank
            </option>
            <template v-for="(user, key) in users">
              <option :key="key" :value="key">
                {{ user.username }}
              </option>
            </template>
          </select>
        </div>
      </div>
      <div class="row align-items-center">
        <div class="col-2">
          cash:
        </div>
        <div class="col-7">
          <input v-model="cashInput" type="number" class="form-control" />
        </div>
        <span class="col-3 text-left">
          / {{ users[fromuid] ? users[fromuid].cash : '...' }}
        </span>
      </div>
      <div class="row">
        <div class="col-12">
          <textarea
            v-model="message"
            class="form-control"
            placeholder="message"
          ></textarea>
        </div>
      </div>
    </form>
    <template v-slot:modal-ok>
      Submit
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['users', 'defaultToUid', 'hasAuth'],
  data: () => ({
    cashInput: 0,
    message: '',
    touid: 'bank',
    fromuid: 'bank',
    isLoading: false
  }),
  computed: {
    ...mapGetters('auth', ['uid'])
  },
  mounted() {
    this.fromuid = this.uid
  },
  methods: {
    ...mapActions('board', ['sendMessage']),
    init() {
      this.reset()
      this.fromuid = this.uid
      this.touid = this.defaultToUid
    },
    reset() {
      this.cashInput = ''
      this.message = ''
      this.touid = 'bank'
    },
    async submit(ev) {
      ev.preventDefault()
      if (this.cashInput < 0 || this.isLoading) return
      this.isLoading = true
      await this.sendMessage({
        from: this.fromuid !== 'bank' ? this.fromuid : '',
        to: this.touid !== 'bank' ? this.touid : '',
        cash: +this.cashInput,
        message: this.message
      }).catch(console.error)
      this.isLoading = false
      this.$bvModal.hide('modal-send-message')
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
