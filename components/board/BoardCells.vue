<template>
  <div>
    <div
      v-for="(cell, idx) in cells"
      :key="idx"
      class="cell"
      :class="{
        'is-here': isHere(uid, idx) && !visited
      }"
    >
      <div class="row align-items-center">
        <transition-group
          class="col-5 d-flex usericon-container"
          name="icon"
          tag="div"
          @after-enter="() => emitScroll(isHere(uid, idx))"
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
        <div class="col-7 d-relative cell-view-wrapper">
          <div class="cell-view" @click="openCellDetailModal(idx)">
            <span class="color-tag" :style="cellColor(cell)"></span>
            <div class="cell-name">
              {{ cell.name }}
            </div>
            <template v-if="isHere(uid, idx)">
              <button
                v-if="cell.type === 0 && !cell.owner"
                class="btn btn-success"
                @click.stop.prevent.once="buyCell(uid, idx)"
              >
                ${{ cell.price }}
              </button>
              <button
                v-else-if="rentPrice(uid, cell)"
                class="btn btn-warning"
                @click.stop.prevent.once="payForRent(uid, cell)"
              >
                ${{ rentPrice(uid, cell) }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import crypto from 'crypto'
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

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
    isHere() {
      return (uid, idx) => {
        if (!(uid in this.positionedUsers(idx))) return ''
        const cellData = this.cells[idx] || {}
        if (cellData.type !== 0) return 'pay'
        const cellDetail = this.cells[idx] || {}
        return !cellDetail.owner ? 'buy' : cellDetail.owner !== uid ? 'pay' : ''
      }
    },
    cellColor() {
      return (cell) => ({
        background: cellColorsData[cell.color_group]
      })
    },
    rentPrice() {
      return (uid, cell) =>
        cell.type !== 0 || !cell.owner || cell.house < 0 || cell.owner === uid
          ? 0
          : cell.rent[cell.house] *
            (1 + (cell.house === 0 && this.isMonopoly(cell)))
    },
    isMonopoly() {
      return (cell) =>
        this.cells
          .filter((c) => c.type === 0 && c.color_group === cell.color_group)
          .every((c) => c.owner === cell.owner)
    }
  },
  methods: {
    ...mapActions('board', ['sendMessage', 'setCell']),
    async payForRent(uid, cell) {
      await this.sendMessage({
        from: uid,
        to: cell.owner,
        timestamp: { created: new Date() },
        cash: this.rentPrice(uid, cell),
        message: `Pay for ${cell.name}'s rent price.`
      })
    },
    async buyCell(uid, cellIdx) {
      const cell = this.cells[cellIdx] || {}
      await Promise.all([
        this.setCell({ idx: cellIdx, cell: { owner: uid } }),
        this.sendMessage({
          from: uid,
          to: '',
          timestamp: { created: new Date() },
          cash: +cell.price,
          message: `Buy ${cell.name}`
        })
      ])
    },
    openPositionModal(ev, uid) {
      if (!this.hasAuth) {
        ev.target.blur()
        return
      }
      this.$emit('position-click', uid)
    },
    openCellDetailModal(cellIdx) {
      this.$emit('cell-click', cellIdx)
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
  &-view-wrapper {
    padding-left: 0;
  }
  &-view {
    padding-left: 15px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 0.25rem;
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
    button.btn {
      font-size: inherit;
      margin-left: auto;
    }
  }
  &-name {
    overflow-x: overlay;
    white-space: nowrap;
  }
  @media (max-width: 959px) {
    .usericon-container .user-icon {
      width: 22px;
      height: 22px;
      font-size: 15px;
    }
    .cell-view {
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
    .cell-view {
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
