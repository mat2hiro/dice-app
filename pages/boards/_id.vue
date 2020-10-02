<template>
  <div class="d-relative wrapper">
    <div
      class="d-sm-flex d-md-none swipe left"
      @click="() => toggleBoardTab('cells')"
    >
      <span><<</span>
    </div>
    <div
      class="d-sm-flex d-md-none swipe right"
      @click="() => toggleBoardTab('default')"
    >
      <span>>></span>
    </div>
    <div
      v-touch:swipe.right="() => toggleBoardTab('cells')"
      v-touch:swipe.left="() => toggleBoardTab('default')"
      class="container board"
    >
      <dice-result
        :dice-user-name="users[dice.uid] ? users[dice.uid].username : ''"
        :dice-value="dice.value"
        :double="throwUser.double"
      />
      <div class="row">
        <div
          ref="boardCells"
          class="col-12 col-md-6 board-column cells"
          :class="{ 'is-visible': tab === 'cells' }"
        >
          <board-cells
            :users="joinedUsers"
            :cells="cells"
            :visited="visited"
            :dice="myDice"
            :has-auth="isOwner(uid) || me.auth.position"
            @position-click="showPositionModal"
            @cell-click="showCellDetailModal"
            @scroll-to-icon="scrollToMyIcon"
          />
        </div>
        <div
          class="col-12 col-md-6 board-column default"
          :class="{ 'is-visible': tab === 'default' }"
        >
          <h2>{{ boardName }}</h2>
          <user-status
            :users="joinedUsers"
            :throw-uid="throwUser.uid"
            :display-name="displayName"
            @username-click="showAuthModal"
            @pay-click="showPayModal"
          />
          <card-result :card="card" :is-your-time="isYourTime" />
          <nuxt-link to="/" class="btn btn-secondary">Leave</nuxt-link>
          <button
            v-if="isOwner(uid)"
            class="btn btn-secondary"
            @click="reset(uid)"
          >
            Reset
          </button>
          <history :history="history" :messages="messages" :users="users" />
        </div>
      </div>
      <footer-buttons
        :users="joinedUsers"
        :is-your-time="isYourTime"
        @pay-click="showPayModal"
        @throw-dice="setMyDice"
      />
      <send-message-modal
        :users="joinedUsers"
        :default-to-uid="modalTarget.to"
        :has-auth="isOwner(uid) || me.auth.payment"
      />
      <change-position-modal
        :users="joinedUsers"
        :default-to-uid="modalTarget.to"
        :cells="cells"
        :has-auth="isOwner(uid) || me.auth.position"
      />
      <change-auth-modal
        :user="joinedUsers[modalTarget.to]"
        :to-uid="modalTarget.to"
        :has-auth="isOwner(uid)"
      />
      <cell-detail-modal
        :users="joinedUsers"
        :cells="cells"
        :cell-idx="modalTarget.cellIdx"
        :has-auth="isOwner(uid) || me.auth.housing"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import firebase from '~/plugins/firebase'

import DiceResult from '~/components/board/DiceResult.vue'
import CardResult from '~/components/board/CardResult.vue'
import History from '~/components/board/History.vue'
import UserStatus from '~/components/board/UserStatus.vue'
import BoardCells from '~/components/board/BoardCells.vue'
import FooterButtons from '~/components/board/FooterButtons.vue'

import SendMessageModal from '~/components/modal/SendMessage.vue'
import ChangePositionModal from '~/components/modal/ChangePosition.vue'
import ChangeAuthModal from '~/components/modal/ChangeAuth.vue'
import CellDetailModal from '~/components/modal/CellDetail.vue'

const boardsRef = firebase.firestore().collection('boards')

export default Vue.extend({
  components: {
    DiceResult,
    CardResult,
    History,
    UserStatus,
    SendMessageModal,
    ChangePositionModal,
    ChangeAuthModal,
    CellDetailModal,
    BoardCells,
    FooterButtons
  },
  async asyncData({ params, redirect, store }) {
    const usersRef = boardsRef.doc(params.id).collection('users')
    const now = new Date()
    const userCount = (
      await usersRef
        .where('timestamp.left', '==', new Date(0))
        .where(
          'timestamp.updated',
          '>',
          new Date(now.getTime() - 2 * 60 * 60 * 1000)
        )
        .get()
    ).size
    const username = store.getters['auth/username']
    const uid = store.getters['auth/uid']
    const me = await usersRef.doc(store.getters['auth/uid']).get()
    const fbPromises = []
    if (!me.exists) {
      fbPromises.push(
        usersRef.doc(uid).set({
          timestamp: {
            joined: now,
            updated: now,
            left: new Date(0)
          },
          order: userCount + 1,
          username,
          cash: 1500,
          position: 0,
          auth: {
            payment: false,
            position: false,
            housing: false
          }
        })
      )
    } else {
      fbPromises.push(
        usersRef.doc(uid).update({
          username,
          timestamp: {
            joined: now,
            updated: now,
            left: new Date(0)
          }
        })
      )
    }
    if (userCount === 0) {
      fbPromises.push(
        boardsRef.doc(params.id).update({
          dice: {
            value: [0, 0],
            uid,
            time: now
          },
          throwUser: {
            uid,
            double: 0
          }
        })
      )
    }
    await Promise.all(fbPromises)

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
      modalTarget: {},
      visited: true,
      myPosition: 0,
      myDice: [],
      tab: 'default',
      unsibscribe: () => {}
    }
  },
  computed: {
    ...mapState('board', [
      'id',
      'boardName',
      'dice',
      'throwUser',
      'users',
      'history',
      'messages',
      'cells',
      'card'
    ]),
    ...mapState('auth', ['uid', 'username']),
    ...mapGetters('board', ['joinedUsers', 'isOwner', 'nextUser']),
    isYourTime() {
      return this.uid === this.throwUser.uid
    },
    me() {
      return this.joinedUsers[this.uid] || { auth: {}, timestamp: {} }
    }
  },
  mounted() {
    this.clear(this.$data.boardId)
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
    this.startListener()
  },
  async destroyed() {
    this.unsubscribe()
    const leftCB = [
      this.setUser({
        uid: this.uid,
        user: {
          'timestamp.left': new Date()
        }
      })
    ]
    if (this.isYourTime) {
      leftCB.push(this.skip(this.uid))
    }
    await Promise.all(leftCB)
    this.stopListener()
  },
  methods: {
    ...mapActions('board', [
      'clear',
      'reset',
      'throwDice',
      'skip',
      'drawCard',
      'setBoard',
      'setUser',
      'startListener',
      'stopListener'
    ]),
    toggleBoardTab(tab = 'default') {
      this.tab = tab
      if (tab === 'cells') this.visited = true
    },
    scrollToMyIcon() {
      const tgt = document.querySelector('#' + this.uid)
      if (tgt && tgt instanceof HTMLElement && tgt.parentElement) {
        this.$refs.boardCells.scrollTop = tgt.parentElement.offsetTop - 100
      }
      this.visited = this.tab === 'cells'
    },
    setMyDice(diceRoll) {
      this.myDice = diceRoll
    },
    showPayModal(uid = 'bank') {
      this.modalTarget = { to: uid }
      this.$nextTick(() => {
        this.$bvModal.show('modal-send-message')
      })
    },
    showPositionModal(uid) {
      this.modalTarget = { to: uid }
      this.$nextTick(() => {
        this.$bvModal.show('modal-change-position')
      })
    },
    showAuthModal(uid) {
      this.modalTarget = { to: uid }
      this.$nextTick(() => {
        this.$bvModal.show('modal-change-auth')
      })
    },
    showCellDetailModal(cellIdx) {
      this.modalTarget = { cellIdx }
      this.$nextTick(() => {
        this.$bvModal.show('modal-cell-detail')
      })
    },
    async clickThrowDice() {
      await this.throwDice({ uid: this.uid })
    }
  }
})
</script>

<style lang="scss">
body {
  overscroll-behavior-y: contain;
}
.wrapper > .swipe {
  position: absolute;
  display: none;
  align-items: center;
  width: 50vw;
  top: 0;
  bottom: 0;
  padding: 0 30px;
  span {
    padding: 15px 0;
    opacity: 0.75;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
  &.left {
    left: 0;
    justify-content: flex-start;
  }
  &.right {
    right: 0;
    justify-content: flex-end;
  }
}
.board {
  > .row {
    overflow-x: hidden;
    flex-wrap: nowrap;
    margin-bottom: 0;
  }
  &-column {
    padding-top: 40px;
    padding-bottom: 40px;
    margin-top: 60px;
    max-height: calc(100vh - 190px);
    overflow-y: auto;
    scroll-behavior: smooth;
    &.cells {
      background: #fafdf6;
      margin-top: 0;
      max-height: calc(100vh - 130px);
    }
    @media (max-width: 767px) {
      transition: transform 0.5s;
      &.cells {
        margin-top: 60px;
        max-height: calc(100vh - 190px);
        transform: translateX(-100%);
        &.is-visible {
          transform: none;
        }
      }
      &.default {
        transform: none;
        &.is-visible {
          transform: translateX(-100%);
        }
      }
    }
  }

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
  button.separated {
    margin-left: 1em;
  }
}

.toast-body > *:last-of-type {
  margin-bottom: 0;
}
</style>
