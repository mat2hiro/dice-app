<template>
  <div class="container">
    <h2>Board Page</h2>
    <div class="form-group">
      <div class="row">
        <div class="col-6">
          <p class="dice">
            {{ diceUserName }}:
            <span class="border" :class="{ 'text-danger': isDoubled }">{{
              diceValues.join(', ')
            }}</span>
          </p>
        </div>
        <div class="col-6">
          <p class="double">Double count: {{ throwUser.double }}</p>
        </div>
      </div>
      <div v-if="isYourTime" class="row">
        <div class="col-6 d-flex align-items-center">
          <p>Now It's Your Turn!</p>
        </div>
        <div class="diceButtons col-6 d-flex justify-content-end">
          <button type="buttton" class="btn btn-primary" @click="throwDice">
            Throw Dice
          </button>
          <button type="button" class="btn btn-success" @click="skip">
            Skip
          </button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <div class="row">
        <div class="col-4 d-flex align-items-center">
          <label>Your Name</label>
        </div>
        <div class="col-8">
          <input
            :value="displayName"
            class="form-control"
            @input="setUsername"
          />
        </div>
      </div>
    </div>
    <div class="form-group">
      <div class="row">
        <div class="col-4 d-flex align-items-top">
          <label>The Order</label>
        </div>
        <div class="col-8">
          <div v-for="user in users" :key="user.uid" class="row">
            <div class="col-6 d-flex align-items-center">
              <label :class="{ 'text-primary': user.uid === throwUser.uid }">{{
                user.username
              }}</label>
            </div>
            <div class="col-6">
              <input
                type="number"
                :disabled="!isOwner"
                :value="user.order"
                class="form-control"
                @input="(ev) => setUserOrder(ev, user)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <nuxt-link to="/"
      ><div class="btn btn-secondary">Leave the board</div></nuxt-link
    >
    <div class="history-container">
      <p>History of dice roll</p>
      <div class="history-bordered">
        <div
          v-for="hist in history"
          :key="hist.time.getTime()"
          class="row history-row"
        >
          <div class="col-12 history-item">
            {{
              hist.time
                ? `${hist.time.getHours()}:${hist.time.getMinutes()}:${hist.time.getSeconds()}`
                : ''
            }}
            | {{ hist.user.username }} ::
            <span>{{ hist.value.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import firebase from '~/plugins/firebase'

const boardsRef = firebase.firestore().collection('boards')

export default Vue.extend({
  async asyncData({ params, redirect, store }) {
    const usersRef = boardsRef.doc(params.id).collection('users')
    const userCount = (await usersRef.where('is_joined', '==', true).get()).size
    const username = store.getters['auth/username']
    const uid = store.getters['auth/uid']
    await usersRef.doc(uid).set({
      joined_at: new Date(),
      is_joined: true,
      order: userCount + 1,
      username
    })
    if (userCount == 0) {
      boardsRef.doc(params.id).update({
        dice: {
          value: [0, 0],
          user: { uid, username }
        },
        throwUser: {
          uid,
          username,
          double: 0
        }
      })
    }
    return {
      boardId: params.id,
      thisBoardRef: boardsRef.doc(params.id),
      usersRef: boardsRef.doc(params.id).collection('users'),
      displayName: username
    }
  },
  data() {
    return {
      boardId: '',
      thisBoardRef: boardsRef.doc('any'),
      usersRef: boardsRef.doc('any').collection('users'),
      displayName: ''
    }
  },
  computed: {
    ...mapState('board', ['dice', 'throwUser', 'users', 'owner', 'history']),
    ...mapState('auth', ['uid']),
    isOwner() {
      return this.uid === this.owner
    },
    isYourTime() {
      return this.uid === this.throwUser.uid
    },
    isDoubled() {
      const diceValue = this.dice && this.dice.value ? this.dice.value : [0, 0]
      return diceValue[0] > 0 && diceValue[0] === diceValue[1]
    },
    diceUserName() {
      return this.dice && this.dice.user && this.dice.user.username
    },
    diceValues() {
      return this.dice && this.dice.value ? this.dice.value : [0, 0]
    }
  },
  mounted() {
    this.$store.dispatch('board/clear')
    this.$store.dispatch('board/startListener', this.$data.boardId)
  },
  async destroyed() {
    this.$store.dispatch('board/stopListener')
    const leftCB = [
      this.$data.usersRef
        .doc(this.uid)
        .update({ left_at: new Date(), is_joined: false })
    ]
    if (this.isYourTime) {
      leftCB.push(this.skip())
    }
    await Promise.all(leftCB)
  },
  methods: {
    getNextUser(isDouble: boolean) {
      const me = this.users.find((u: any) => u.uid === this.uid)
      const meOrder = me.order === this.users.length ? 0 : me.order
      return isDouble || this.users.length <= 1
        ? me
        : this.users.reduce(
            (pre: any, u: any) => {
              return meOrder < u.order && pre.order > u.order ? u : pre
            },
            { order: 100 }
          )
    },
    async throwDice() {
      const diceRoll = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      const isDouble = diceRoll[0] === diceRoll[1]
      const next = this.getNextUser(isDouble)
      await Promise.all([
        this.$data.thisBoardRef.update({
          dice: {
            value: diceRoll,
            user: { uid: this.uid, username: this.$data.displayName }
          },
          throwUser: {
            uid: next.uid,
            username: next.username,
            double: isDouble ? this.throwUser.double + 1 : 0
          }
        })
      ])
    },
    async skip() {
      const next = this.getNextUser(false)
      await this.$data.thisBoardRef.update({
        throwUser: { uid: next.uid, username: next.username, double: 0 }
      })
    },
    async setUserOrder(ev, user) {
      await this.$data.usersRef
        .doc(user.uid)
        .update({ order: +ev.target.value })
    },
    async setUsername(ev) {
      this.$data.displayName = ev.target.value
      await this.$data.usersRef
        .doc(this.uid)
        .update({ username: ev.target.value })
    }
  }
})
</script>

<style lang="scss" scoped>
label,
p {
  margin: 0;
}
h2 {
  margin-bottom: 1.3em;
}
.row {
  margin-bottom: 1em;
}
.dice {
  font-size: 1.2em;
  span {
    padding: 0.3em;
    border-radius: 3px;
  }
}
.diceButtons button {
  margin-left: 1em;
}
.history-container {
  margin-top: 2em;
  .history-bordered {
    padding: 0.5em 1em;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-y: auto;
    max-height: 500px;
  }
  .history-row {
    width: 100%;
    padding: 0.5em 0;
    margin: 0;
    border-bottom: 1px solid #eee;
  }
}
</style>
