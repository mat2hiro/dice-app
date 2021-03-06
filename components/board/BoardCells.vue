<template>
  <div>
    <div
      v-for="(cell, idx) in cells"
      :key="idx"
      class="cell"
      :class="{
        'is-here': isHere(uid, idx),
        visited: isHere(uid, idx) && !visited,
        mortgage: cell.house < 0
      }"
    >
      <div v-if="cell.owner" class="own-icon" :class="`house-${cell.house}`">
        <div class="wrapper" :style="ownIconBg(cell.owner)">
          <span
            v-for="i of Math.max(cell.house, 0)"
            :key="i"
            :style="userIconHouse(cell.owner)"
          ></span>
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
            :user="users[key]"
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
                v-if="cell.type === cellTypes.HOUSE && !cell.owner"
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
              <button
                v-else-if="cell.type === cellTypes.TAX"
                class="btn btn-warning"
                @click.stop.prevent.once="payTax(uid, cell)"
              >
                ${{ cell.price || 0 }}
              </button>
              <button
                v-else-if="cell.type === cellTypes.CARD"
                class="btn btn-warning"
                @click.prevent.once="drawCard(uid, cell)"
              >
                draw
              </button>
              <button
                v-else-if="cell.type === cellTypes.JAIL && inJail"
                class="btn btn-warning"
                @click.stop.prevent.once="releaseFromJail(uid)"
              >
                ${{ releasePrice }}
              </button>
              <button
                v-else-if="cell.type === cellTypes.ARREST"
                class="btn btn-warning"
                @click.stop.prevent.once="goToJail(uid)"
              >
                Go
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

import UserButton from '~/components/parts/UserButton.vue'
import { bgColorStyle } from '~/services'
import {
  cellColorsData,
  CellTypes,
  InfraTypes,
  CardTypes
} from '~/static/ts/monopoly-cells.ts'

export default Vue.extend({
  components: {
    UserButton
  },
  props: ['users', 'cells', 'visited', 'dice', 'hasAuth'],
  data() {
    return {
      cellColors: cellColorsData,
      cellTypes: CellTypes
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
    ownIconBg() {
      return (uid) => {
        const col = bgColorStyle(this.$props.users[uid]?.color)
        return {
          '--main-bg-color': col.background,
          'background-color': 'var(--main-bg-color)'
        }
      }
    },
    userIconHouse() {
      return (uid) => {
        return {
          'background-color': bgColorStyle(this.$props.users[uid]?.color).color
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
        if (cellData.type !== CellTypes.HOUSE) return 'pay'
        const cellDetail = this.cells[idx] || {}
        return !cellDetail.owner ? 'buy' : cellDetail.owner !== uid ? 'pay' : ''
      }
    },
    cellColor() {
      return (cell) => ({
        background: cellColorsData[cell.colorGroup]
      })
    },
    inJail() {
      return (this.$props.users?.[this.uid]?.jail || 0) > 0
    },
    releasePrice() {
      return this.$props.users?.[this.uid]?.releaseCard ? 0 : 50
    },
    rentPrice() {
      return (uid, cell) => {
        if (
          cell.type !== CellTypes.HOUSE ||
          cell.house < 0 ||
          !cell.owner ||
          cell.owner === uid
        ) {
          return 0
        }
        if (cell.infra === InfraTypes.RAILROAD) {
          return cell.rent[this.numPossession(cell) - 1]
        } else if (cell.infra === InfraTypes.UTILITY) {
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
              (c) =>
                c.type === CellTypes.HOUSE && c.colorGroup === cell.colorGroup
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
    ...mapActions('board', [
      'sendMessage',
      'setCell',
      'goToJail',
      'releaseFromJail',
      'drawCommunityChest',
      'drawChance'
    ]),
    async payForRent(uid, cell) {
      await this.sendMessage({
        from: uid,
        to: cell.owner,
        cash: this.rentPrice(uid, cell),
        message: `Pay for ${cell.name}'s rent price.`
      })
    },
    async payTax(uid, cell) {
      await this.sendMessage({
        from: uid,
        cash: cell.price || 0,
        message: `Pay for ${cell.name}.`
      })
    },
    async drawCard(uid, cell) {
      if (cell.cardGroup === CardTypes.CHANCE) {
        await this.drawChance({ uid })
      } else {
        await this.drawCommunityChest({ uid })
      }
    },
    async buyCell(uid, cellIdx) {
      const cell = this.cells[cellIdx] || {}
      await Promise.all([
        this.setCell({ idx: cellIdx, cell: { owner: uid } }),
        this.sendMessage({
          from: uid,
          to: '',
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
    &.visited {
      background-color: #17a2b8;
    }
  }
  &.mortgage {
    background: #a5a5a5;
  }
  .own-icon {
    position: absolute;
    height: 1.4em;
    width: 1em;
    top: 0;
    right: 0;

    .wrapper {
      position: relative;
      width: 100%;
      height: 100%;

      border: 1px solid #a5a5a5;
      border-bottom: none;

      span {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
      }

      &::before,
      &::after {
        display: block;
        position: absolute;
        content: '';
        height: 0.5em;
        width: 0.5em;
        top: calc(100% - 1px);
      }

      &::before {
        left: -1px;
        background: linear-gradient(
          135deg,
          var(--main-bg-color) 50%,
          #a5a5a5 50%,
          #a5a5a5 60%,
          transparent 60%
        );
        border-left: 1px solid #a5a5a5;
      }

      &::after {
        right: -1px;
        background: linear-gradient(
          225deg,
          var(--main-bg-color) 50%,
          #a5a5a5 50%,
          #a5a5a5 60%,
          transparent 60%
        );
        border-right: 1px solid #a5a5a5;
      }
    }

    .wrapper > span {
      &:nth-child(1) {
        top: 2px;
        right: 2px;
      }
      &:nth-child(2) {
        top: 2px;
        left: 2px;
      }
      &:nth-child(3) {
        bottom: calc(0.4em + 3px);
        right: 2px;
      }
      &:nth-child(4) {
        bottom: calc(0.4em + 3px);
        left: 2px;
      }
      &:nth-child(5) {
        width: unset;
        height: unset;
        top: 2px;
        right: 2px;
        left: 2px;
        bottom: calc(0.2em + 1px);
        border-radius: 2px;
      }
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
