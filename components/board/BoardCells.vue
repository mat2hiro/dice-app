<template>
  <div>
    <div
      v-for="(cell, idx) in cells"
      :key="idx"
      class="cell"
      :class="{
        'is-here': uid in positionedUsers(idx) && !visited
      }"
    >
      <div class="row align-items-center">
        <transition-group
          class="col-5 d-flex usericon-container"
          name="icon"
          tag="div"
        >
          <button
            v-for="key in positionedUsers(idx)"
            :id="key"
            :key="key"
            class="user-icon"
            type="button"
            :style="userColor(key)"
            @click="(e) => openPositionModal(e, key)"
          >
            {{ users[key].username[0] }}
          </button>
        </transition-group>
        <div class="col-7 cell-name">
          {{ cell.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import crypto from 'crypto'
import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.extend({
  props: ['users', 'cells', 'uid', 'visited'],
  computed: {
    ...mapGetters('board', ['isOwner']),
    positionedUsers() {
      return (idx) => {
        return Object.keys(this.users).reduce((pre, k) => {
          if (this.users[k].position === idx % 40) {
            pre[k] = k
          }
          return pre
        }, {})
      }
    },
    userColor() {
      return (uid) => {
        const bg =
          '#' +
          crypto
            .createHash('md5')
            .update(uid)
            .digest('hex')
            .slice(0, 6)
        const r = parseInt(bg.substr(1, 2), 16)
        const g = parseInt(bg.substr(3, 2), 16)
        const b = parseInt(bg.substr(5, 2), 16)

        const cl = (r * 299 + g * 587 + b * 114) / 1000 < 128 ? '#fff' : '#000'
        return {
          background: bg,
          color: cl
        }
      }
    }
  },
  methods: {
    openPositionModal(ev, uid) {
      if (!this.isOwner(this.uid)) {
        ev.target.blur()
        return
      }
      this.$emit('position-click', uid)
    }
  }
})
</script>

<style lang="scss" scoped>
.cell {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  @media (max-width: 767px) {
    transition: background-color 1s;
    &.is-here {
      background-color: #17a2b8;
    }
  }
  .row {
    margin-bottom: 0 !important;
  }
  .usericon-container {
    flex-wrap: wrap;
    .user-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-right: 10px;
      width: 24px;
      height: 24px;
      border: 1px solid #ccc;
      border-radius: 50%;
      overflow: hidden;
      &:last-of-type {
        margin-right: 0;
      }
    }
  }
  @media (max-width: 959px) {
    .usericon-container .user-icon {
      width: 22px;
      height: 22px;
      font-size: 15px;
    }
    .cell-name {
      font-size: 15px;
    }
  }
  @media (max-width: 375px) {
    .usericon-container .user-icon {
      font-size: 4vw;
      margin-right: 2.67vw;
      width: 6.4vw;
      height: 6.4vw;
    }
    .cell-name {
      font-size: 4vw;
    }
  }
}
.icon-enter-active {
  transition: all 0.25s;
}
.icon-leave-active {
  transition: all 0.25s;
}
.icon-enter,
.icon-leave-to {
  opacity: 0;
}

.icon-enter {
  transform: translateY(-30px);
}

.icon-leave-to {
  transform: translateY(30px);
}
</style>
