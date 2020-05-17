<template>
  <div class="form-group">
    <div class="row">
      <div class="col-12 col-md-4 d-flex align-items-center">
        <label>Your Name</label>
      </div>
      <div class="col-12 col-md-8">
        <input :value="nameInput" class="form-control" @keyup="setUsername" />
      </div>
    </div>
    <div class="row align-items-top">
      <div class="col-12 col-md-4 d-flex">
        <label class="orders-label">Status</label>
      </div>
      <div class="col-12 col-md-8 orders">
        <div class="row status-row">
          <label class="col-3">Order</label>
          <label class="col-4">Name</label>
          <label class="col-5">Cash</label>
        </div>
        <div
          v-for="(user, key) in joinedUsers"
          :key="key"
          class="row align-items-center"
        >
          <div class="order-input col-3">
            <input
              type="number"
              :disabled="!isOwner(uid)"
              :value="user.order"
              class="form-control"
              @input="(ev) => setUserOrder(ev, key)"
            />
          </div>
          <div class="col-4">
            <label :class="{ 'text-primary': key === throwUid }">{{
              user.username
            }}</label>
          </div>
          <div class="cash-input col-5 d-flex align-items-center">
            <input
              type="number"
              :disabled="!isOwner(uid)"
              :value="user.cash"
              class="form-control"
              @input="(ev) => setUserCash(ev, key)"
            />
            <span>$</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['joinedUsers', 'throwUid', 'uid', 'displayName'],
  data() {
    return {
      nameInput: this.$props.displayName
    }
  },
  computed: {
    ...mapGetters('board', ['isOwner'])
  },
  methods: {
    ...mapActions('board', ['setUser']),
    async setUsername(ev) {
      if (!ev.target.value) return
      this.$data.nameInput = ev.target.value
      await this.setUser({ uid: this.uid, user: { username: ev.target.value } })
    },
    async setUserOrder(ev, uid) {
      if (!ev.target.value) return
      await this.setUser({ uid, user: { order: +ev.target.value } })
    },
    async setUserCash(ev, uid) {
      await this.setUser({ uid, user: { cash: +ev.target.value } })
    }
  }
})
</script>

<style lang="scss" scoped>
.orders-label {
  padding-top: 0.5em;
}
.orders .row:last-child {
  margin-bottom: 0;
}
.status-row {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.cash-input span {
  margin-left: 0.5em;
}
</style>
