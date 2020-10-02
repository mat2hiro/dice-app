<template>
  <div>
    <div
      v-for="(cell, idx) in cells"
      :key="idx"
      class="cell"
      :class="{
        'is-here': isHere(uid, idx) && !visited,
        mortage: cell.house < 0
      }"
    >
      <div
        v-if="cell.owner"
        class="own-icon"
        :class="`house-${cell.house}`"
        :style="iconBg(uid)"
      >
        <div class="houses">
          <span v-for="i of cell.house" :key="i" :style="iconHouse(uid)"></span>
        </div>
      </div>
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
import { userColor } from '~/services'
import { cellColorsData } from '~/static/ts/monopoly-cells.ts'

export default Vue.extend({
  components: {
    UserButton
  },
  props: ['users', 'cells', 'visited', 'dice', 'hasAuth'],
  data() {
    return {
      cellColors: cellColorsData
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
    iconBg() {
      return (uid) => {
        const col = userColor(uid)
        return {
          'border-color': `transparent ${col.background} transparent transparent`,
          color: col.color
        }
      }
    },
    iconHouse() {
      return (uid) => {
        return {
          'background-color': userColor(uid).color
        }
      }
    },
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
      return (uid, cell) => {
        if (
          cell.type !== 0 ||
          cell.house < 0 ||
          !cell.owner ||
          cell.owner === uid
        ) {
          return 0
        }
        if (cell.infra === 1) {
          return cell.rent[this.numPossession(cell) - 1]
        } else if (cell.infra === 2) {
          return (
            cell.rent[this.numPossession(cell) - 1] *
            this.dice.reduce((p, v) => p + v, 0)
          )
        } else {
          return (
            cell.rent[cell.house] *
            (1 + (cell.house === 0 && this.isMonopoly(cell)))
          )
        }
      }
    },
    sameColorCell() {
      return (cell) =>
        this.cells
          ? this.cells.filter(
              (c) => c.type === 0 && c.color_group === cell.color_group
            )
          : []
    },
    numPossession() {
      return (cell) =>
        this.sameColorCell(cell).filter((c) => c.owner === cell.owner).length
    },
    isMonopoly() {
      return (cell) =>
        !!cell.owner &&
        this.sameColorCell(cell).every((c) => c.owner === cell.owner)
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
  position: relative;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  @media (max-width: 767px) {
    transition: background-color 1s;
    &.is-here {
      background-color: #17a2b8;
    }
  }
  &.mortage {
    background: #a5a5a5;
  }
  .own-icon {
    position: absolute;
    height: 1.5em;
    width: 1.5em;
    top: 0;
    right: 0;

    border-style: solid;
    border-width: 0 1.5em 1.5em 0;

    text-align: right;

    .houses {
      position: relative;
      width: 1.5em;
      height: 1.5em;

      span {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
      }
    }

    .houses span {
      &:nth-child(1) {
        top: 0.05em;
        right: 0.05em;
      }
      &:nth-child(2) {
        top: 0.05em;
        right: 0.35em;
      }
      &:nth-child(3) {
        top: 0.35em;
        right: 0.05em;
      }
      &:nth-child(4) {
        top: 0.35em;
        right: 0.35em;
      }
      &:nth-child(5) {
        width: 10px;
        height: 10px;
        top: 0.05em;
        right: 0.05em;
      }
    }

    // &.house-1 {
    //   .houses span {
    //     top: 0.2em;
    //     right: 0.2em;
    //   }
    // }
    // &.house-2 {
    //   .houses span {
    //     &:nth-child(1) {
    //       top: 0.05em;
    //       right: 0.35em;
    //     }
    //     &:nth-child(2) {
    //       top: 0.35em;
    //       right: 0.05em;
    //     }
    //   }
    // }
    // &.house-3 {
    //   .houses span {
    //     &:nth-child(1) {
    //       top: 0.35em;
    //       right: 0.35em;
    //     }
    //     &:nth-child(2) {
    //       top: 0.05em;
    //       right: 0.35em;
    //     }
    //     &:nth-child(3) {
    //       top: 0.35em;
    //       right: 0.05em;
    //     }
    //   }
    // }
    // &.house-4 {
    //   .houses span {
    //     &:nth-child(1) {
    //       top: 0.35em;
    //       right: 0.35em;
    //     }
    //     &:nth-child(2) {
    //       top: 0.05em;
    //       right: 0.35em;
    //     }
    //     &:nth-child(3) {
    //       top: 0.35em;
    //       right: 0.05em;
    //     }
    //     &:nth-child(4) {
    //       top: 0.05em;
    //       right: 0.05em;
    //     }
    //   }
    // }
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
