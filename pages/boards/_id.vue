<template>
  <div class="container board">
    <h2>Board Page</h2>
    <dice-result
      :dice-user-name="users[dice.uid] ? users[dice.uid].username : ''"
      :dice-value="dice.value"
      :double="throwUser.double"
      :card="card"
      :is-yourtime="isYourTime"
    />
    <user-status
      :joined-users="joinedUsers"
      :throw-uid="throwUser.uid"
      :display-name="displayName"
      :uid="uid"
    />
    <nuxt-link to="/"
      ><div class="btn btn-secondary">Leave the board</div></nuxt-link
    >
    <history :history="history" :messages="messages" :users="users" />
    <div class="footer-item">
      <div class="container">
        <div class="row justify-content-end">
          <div class="diceButtons col-12 col-md-6 d-flex justify-content-end">
            <button
              v-if="isYourTime"
              type="buttton"
              class="btn btn-primary separated"
              @click="clickThrowDice"
            >
              Throw Dice
            </button>
            <button
              v-if="isYourTime"
              type="button"
              class="btn btn-success separated"
              @click="skip(uid)"
            >
              Skip
            </button>
            <button
              v-b-modal.modal-send-message
              type="button"
              class="btn btn-outline-primary separated"
            >
              Pay
            </button>
          </div>
        </div>
      </div>
    </div>
    <send-message-modal :users="joinedUsers" :meuid="uid" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import firebase from '~/plugins/firebase'

import DiceResult from '~/components/board/DiceResult.vue'
import History from '~/components/board/History.vue'
import UserStatus from '~/components/board/UserStatus.vue'

import SendMessageModal from '~/components/modal/SendMessageModal.vue'

const boardsRef = firebase.firestore().collection('boards')

export default Vue.extend({
  components: {
    DiceResult,
    History,
    UserStatus,
    SendMessageModal
  },
  async asyncData({ params, redirect, store }) {
    const usersRef = boardsRef.doc(params.id).collection('users')
    const userCount = (await usersRef.where('is_joined', '==', true).get()).size
    const username = store.getters['auth/username']
    const uid = store.getters['auth/uid']
    await usersRef.doc(uid).set({
      joined_at: new Date(),
      is_joined: true,
      order: userCount + 1,
      username,
      cash: 1500
    })
    if (userCount === 0) {
      boardsRef.doc(params.id).update({
        dice: {
          value: [0, 0],
          uid,
          time: new Date()
        },
        throwUser: {
          uid,
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
      displayName: '',
      randVal: [0, 16],
      unsibscribe: () => {}
    }
  },
  computed: {
    ...mapState('board', [
      'dice',
      'throwUser',
      'users',
      'history',
      'messages',
      'card'
    ]),
    ...mapState('auth', ['uid', 'username']),
    ...mapGetters('board', ['joinedUsers', 'isOwner', 'nextUser']),
    isYourTime() {
      return this.uid === this.throwUser.uid
    }
  },
  mounted() {
    this.clear(this.$data.boardId)
    this.startListener()
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'board/setM') {
        const message = mutation.payload
        const fromName = this.users[message.from]
          ? this.users[message.from].username
          : 'Bank'
        const toName = this.users[message.to]
          ? this.users[message.to].username
          : 'Bank'
        const h = this.$createElement
        const msgP = [h('p', `${fromName} -> ${toName} $${message.cash}`)]
        if (message.message) {
          msgP.push(h('p', `"${message.message}"`))
        }
        this.$bvToast.toast(msgP, {
          title: 'Send Payment',
          autoHideDelay: 3000
        })
      }
    })
  },
  async destroyed() {
    console.log('dest')
    this.unsubscribe()
    this.stopListener()
    const leftCB = [
      this.setUser({
        uid: this.uid,
        user: {
          left_at: new Date(),
          is_joined: false
        }
      })
    ]
    if (this.isYourTime) {
      leftCB.push(this.skip(this.uid))
    }
    await Promise.all(leftCB)
  },
  methods: {
    ...mapActions('board', [
      'clear',
      'throwDice',
      'skip',
      'drawCard',
      'setBoard',
      'setUser',
      'startListener',
      'stopListener'
    ]),
    async clickThrowDice() {
      await this.throwDice({ uid: this.uid })
    }
  }
})
</script>

<style lang="scss">
.board {
  label,
  p {
    margin: 0;
  }
  h2 {
    margin-bottom: 1.3em;
  }
  .form-group {
    padding-bottom: 1em;
    margin-bottom: 2em;
    border-bottom: 1px solid #eee;
  }
  .row {
    margin-bottom: 1em;
  }
  .row.board-stat {
    margin-bottom: 0.5em;
    > div {
      margin-bottom: 0.5em;
    }
  }
  .dice {
    font-size: 1.2em;
    span {
      padding: 0.3em;
      border-radius: 3px;
    }
  }
  button.separated {
    margin-left: 1em;
  }

  .footer-item {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    border-top: 2px solid #ccc;
    padding: 15px;
    .row:last-of-type {
      margin-bottom: 0;
    }
  }
}

.toast-body > *:last-of-type {
  margin-bottom: 0;
}
</style>
