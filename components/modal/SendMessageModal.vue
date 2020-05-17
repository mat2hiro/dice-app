<template>
  <b-modal id="modal-send-message" @show="reset" @ok="submit" @hidden="reset">
    <div class="form-group">
      <div class="row align-items-center">
        <span class="col-2">
          from:
        </span>
        <div class="col-10">
          <select :value="fromuid" class="form-control" @change="fromChange">
            <option v-if="isOwner(meuid)" value="">
              Bank
            </option>
            <template v-for="(user, key) in users">
              <option
                v-if="key === meuid || isOwner(meuid)"
                :key="key"
                :value="key"
              >
                {{ user.username }}
              </option>
            </template>
          </select>
        </div>
        <span class="col-2">to:</span>
        <div class="col-10">
          <select v-model="touid" class="form-control">
            <option value="">
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
          / {{ users[meuid] ? users[meuid].cash : '0' }}
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
    </div>
    <template v-slot:modal-ok>
      Submit
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['users', 'meuid'],
  data: () => ({
    cashInput: 0,
    message: '',
    touid: '',
    fromuid: ''
  }),
  computed: {
    ...mapGetters('board', ['isOwner'])
  },
  mounted() {
    this.fromuid = this.meuid
  },
  methods: {
    ...mapActions('board', ['sendMessage']),
    fromChange(ev) {
      this.fromuid = ev.target.value
    },
    reset() {
      this.cashInput = 0
      this.message = ''
      this.touid = ''
    },
    async submit(ev) {
      if (this.cashInput < 0) ev.preventDefault()
      await this.sendMessage({
        from: this.isOwner(this.meuid) ? this.fromuid : this.meuid,
        to: this.touid,
        time: new Date(),
        cash: +this.cashInput,
        message: this.message
      })
      this.reset()
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
