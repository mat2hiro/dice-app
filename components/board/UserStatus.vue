<template>
  <div class="form-group">
    <div class="row">
      <div class="col-12 d-flex align-items-center">
        <label>Your Name</label>
      </div>
      <div class="col-12">
        <div class="input-group">
          <input
            :value="me.username"
            class="form-control"
            maxlength="16"
            @input="setUsername"
          />
          <div class="input-group-append">
            <label
              class="btn btn-light is-bordered is-relative d-flex align-items-center"
            >
              <div class="col-prev" :style="{ background: me.color }"></div>
              <input
                class="display-invisible"
                type="color"
                :value="me.color"
                @change="setUserColor"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="row align-items-top">
      <div class="col-12 d-flex">
        <label class="orders-label">Status</label>
      </div>
      <div class="col-12 orders">
        <div class="row status-row">
          <label class="col-3">Order</label>
          <label class="col-4">Name</label>
          <label class="col-5">Cash</label>
        </div>
        <div
          v-for="(user, key) in users"
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
          <div
            class="username col-4 d-flex align-items-center p-relative"
            @click="openAuthModal(key)"
          >
            <label :class="{ 'text-primary': key === throwUid }">{{
              user.username
            }}</label>
            <div v-if="user.releaseCard > 0" class="card-container">
              <span
                class="cards"
                :class="{ 'is-2': user.releaseCard > 1 }"
              ></span>
            </div>
          </div>
          <div class="cash-input col-5 d-flex align-items-center">
            <div class="input-group">
              <input
                type="number"
                :disabled="!isOwner(uid)"
                :value="user.cash"
                class="form-control"
                @input="(ev) => setUserCash(ev, key)"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-light is-bordered"
                  @click="openPayModal(key)"
                >
                  $
                </button>
              </div>
            </div>
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
  props: ['users', 'throwUid', 'me'],
  computed: {
    ...mapGetters('auth', ['uid']),
    ...mapGetters('board', ['isOwner'])
  },
  methods: {
    ...mapActions('board', ['setBoardUser']),
    openPayModal(uid) {
      this.$emit('pay-click', uid)
    },
    openAuthModal(uid) {
      this.$emit('username-click', uid)
    },
    async setUsername(ev) {
      if (!ev.target.value) return
      await this.setBoardUser({
        uid: this.uid,
        user: { username: ev.target.value }
      })
    },
    async setUserColor(ev) {
      if (!ev.target.value) return
      await this.setBoardUser({
        uid: this.uid,
        user: { color: ev.target.value }
      })
    },
    async setUserOrder(ev, uid) {
      if (!ev.target.value) return
      await this.setBoardUser({ uid, user: { order: +ev.target.value } })
    },
    async setUserCash(ev, uid) {
      ev.preventDefault()
      await this.setBoardUser({ uid, user: { cash: +ev.target.value } })
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
.username {
  cursor: pointer;
  > * {
    cursor: pointer;
  }
}
.btn.is-bordered {
  border: 1px solid #ced4da;
}
.col-prev {
  width: 1em;
  height: 1em;
}
.display-invisible {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  padding: 0;
  border: 0;
  visibility: hidden;
}
.card-container {
  position: absolute;
  right: 0;
  width: 15px;
  top: 0;
  bottom: 0;
  border: none;
  .cards {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    &::before,
    &::after {
      position: absolute;
      width: 0.7em;
      height: 1em;
      background: #ead1dc;
      border-radius: 2px;
      border: 1px solid #a5a5a5;
    }
    &::before {
      content: '';
      top: calc(50% - 0.5em);
      left: 0;
      z-index: 2;
    }
    &.is-2 {
      &::before {
        top: calc(50% - 0.4em);
      }
      &::after {
        content: '';
        top: calc(50% - 0.6em);
        left: 0.2em;
        z-index: 1;
      }
    }
  }
}
</style>
