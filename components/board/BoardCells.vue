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
          @after-enter="() => emitScroll(uid in positionedUsers(idx))"
        >
          <user-button
            v-for="key in positionedUsers(idx)"
            :key="key"
            :html-id="key"
            :username="users[key].username"
            :uid="key"
            :on-click="(e) => openPositionModal(e, key)"
          />
        </transition-group>
        <div class="col-7 d-relative cell-name">
          <span class="color-tag" :style="cellColor(cell)"></span>
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

import UserButton from '~/components/parts/UserButton.vue'
import { cellColorsData } from '~/static/ts/monopoly-cells.ts'

export default Vue.extend({
  components: {
    UserButton
  },
  props: ['users', 'cells', 'visited', 'hasAuth'],
  data() {
    return {
      cellColors: cellColorsData
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
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
    cellColor() {
      return (cell) => ({
        background: cellColorsData[cell.color_group]
      })
    }
  },
  methods: {
    openPositionModal(ev, uid) {
      if (!this.hasAuth) {
        ev.target.blur()
        return
      }
      this.$emit('position-click', uid)
    },
    emitScroll(isHere = false) {
      if (!isHere) return
      this.$emit('scroll-to-icon')
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
  }
  .color-tag {
    position: absolute;
    left: 0;
    width: 5px;
    height: 100%;
    background: #fff;
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
.icon-enter-active,
.icon-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease-in-out;
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
