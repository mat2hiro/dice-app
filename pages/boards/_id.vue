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
            :uid="uid"
            :cells="boardCells"
            :visited="visited"
            @position-click="showPositionModal"
            @scroll-to-icon="scrollToMyIcon"
          />
        </div>
        <div
          class="col-12 col-md-6 board-column default"
          :class="{ 'is-visible': tab === 'default' }"
        >
          <user-status
            :joined-users="joinedUsers"
            :throw-uid="throwUser.uid"
            :display-name="displayName"
            :uid="uid"
            @user-click="showPayModal"
          />
          <card-result :card="card" :is-your-time="isYourTime" />
          <nuxt-link to="/" class="btn btn-secondary"
            >Leave the board</nuxt-link
          >
          <history :history="history" :messages="messages" :users="users" />
        </div>
      </div>
      <footer-buttons
        :users="joinedUsers"
        :uid="uid"
        :is-your-time="isYourTime"
        @pay-click="showPayModal"
      />
      <send-message-modal
        :users="joinedUsers"
        :meuid="uid"
        :default-to-uid="payTo"
        :is-owner="isOwner(uid)"
      />
      <change-position-modal
        :users="joinedUsers"
        :meuid="uid"
        :default-to-uid="positionTo"
        :cells="boardCells"
        :is-owner="isOwner(uid)"
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

import SendMessageModal from '~/components/modal/SendMessageModal.vue'
import ChangePositionModal from '~/components/modal/ChangePositionModal.vue'

import { boardCellsData } from '~/static/ts/monopoly-cells.ts'

const boardsRef = firebase.firestore().collection('boards')

export default Vue.extend({
  components: {
    DiceResult,
    CardResult,
    History,
    UserStatus,
    SendMessageModal,
    ChangePositionModal,
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
    const fbPromises = []
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
        position: 0
      })
    )
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
      payTo: '',
      positionTo: '',
      boardCells: boardCellsData,
      visited: true,
      myPosition: 0,
      tab: 'default',
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
    this.unsubscribe()
    this.stopListener()
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
    showPayModal(uid = 'bank') {
      this.payTo = uid
      this.$nextTick(() => {
        this.$bvModal.show('modal-send-message')
      })
    },
    showPositionModal(uid) {
      this.positionTo = uid
      this.$nextTick(() => {
        this.$bvModal.show('modal-change-position')
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
}

.toast-body > *:last-of-type {
  margin-bottom: 0;
}
</style>
