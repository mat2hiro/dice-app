<template>
  <div class="footer-item">
    <div class="wrapper d-relative">
      <div class="container">
        <div class="row justify-content-end">
          <div class="diceButtons col-md-6 d-flex justify-content-end">
            <div class="d-md-none">
              <input id="ui-open" class="d-none" type="checkbox" />
              <label for="ui-open" class="uiopen-label"> </label>
              <div class="user-icons">
                <div class="container d-flex">
                  <user-button
                    v-for="(user, key) in users"
                    :key="key"
                    :username="user.username"
                    :color="user.color"
                    :on-click="() => openPayModal(key)"
                  />
                </div>
              </div>
            </div>
            <button
              v-if="isYourTime"
              type="buttton"
              class="btn btn-primary separated"
              :disabled="isLoading"
              @click="clickThrowDice"
            >
              Throw Dice
            </button>
            <button
              v-if="isYourTime"
              type="button"
              class="btn btn-success separated"
              :disabled="isLoading"
              @click="clickSkip()"
            >
              Skip
            </button>
            <button
              type="button"
              class="btn btn-outline-primary separated"
              @click="openPayModal()"
            >
              Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import UserButton from '~/components/parts/UserButton.vue'

export default Vue.extend({
  components: {
    UserButton
  },
  props: ['users', 'isYourTime'],
  data() {
    return {
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
    ...mapGetters('board', ['isOwner'])
  },
  methods: {
    ...mapActions('board', ['throwDice', 'skip']),
    openPayModal(uid = 'bank') {
      this.$emit('pay-click', uid)
    },
    async clickSkip() {
      this.isLoading = true
      await this.skip(this.uid).catch(console.error)
      this.isLoading = false
    },
    async clickThrowDice() {
      this.isLoading = true
      const diceRoll = await this.throwDice({ uid: this.uid }).catch(
        console.error
      )
      this.isLoading = false
      this.$emit('throw-dice', diceRoll)
    }
  }
})
</script>

<style lang="scss" scoped>
.footer-item {
  position: fixed;
  z-index: 90;
  bottom: 0;
  left: 0;
  height: 70px;
  width: 100%;
  background: #fff;
  border-top: 2px solid #ccc;
  .wrapper > .container {
    position: static;
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .row {
    position: static;
    &:last-of-type {
      margin-bottom: 0;
    }
  }
  .diceButtons {
    position: static;
    button.separated:first-of-type {
      margin-left: auto;
    }
  }
}
.user-icons {
  display: none;
  position: absolute;
  background: #fff;
  border-top: 2px solid #ccc;
  bottom: calc(100% - 1px);
  left: 0;
  right: 0;
  padding-top: 15px;
  .user-icon {
    width: 26px;
    height: 26px;
    margin-right: 10px;
    border-radius: 50%;
  }
}

.uiopen-label {
  cursor: pointer;
  position: relative;
  height: 100%;
  width: 30px;
  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: 50%;
    background: #555;
    width: 15px;
    height: 2px;
    border-radius: 1px;
  }
  &::before {
    transform: rotate(-45deg);
    left: 3px;
  }
  &::after {
    transform: rotate(45deg);
    right: 3px;
  }
}

#ui-open:checked ~ .user-icons {
  display: block;
}

#ui-open:checked ~ .uiopen-label {
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
}
</style>
