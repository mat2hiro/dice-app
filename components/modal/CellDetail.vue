<template>
  <b-modal
    id="modal-cell-detail"
    :title="cell.name"
    @show="init"
    @ok="submit"
    @hidden="reset"
  >
    <div v-if="cell.type === cellTypes.HOUSE">
      <form class="form-group" @submit.stop.prevent="submit">
        <div class="row align-items-center">
          <div class="col-4">
            <div class="card text-center">
              <div class="card-header">price</div>
              <div class="card-body">${{ cell.price }}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="card text-center">
              <div class="card-header">rent</div>
              <div class="card-body">${{ rentPrice }}</div>
            </div>
          </div>
          <div class="col-4">
            <div v-if="!cell.infra" class="card text-center">
              <div class="card-header">build</div>
              <div class="card-body">${{ cell.buildPrice }}</div>
            </div>
          </div>
        </div>
        <hr />
        <div class="row align-items-center">
          <span class="col-3">owner:</span>
          <div class="col-9">
            <select
              v-model="ownerId"
              class="form-control"
              :disabled="!isOwner"
              @change="checkEditability"
            >
              <option>
                nobody
              </option>
              <template v-for="(user, key) in users">
                <option :key="key" :value="key">
                  {{ user.username }}
                </option>
              </template>
            </select>
          </div>
        </div>
        <div class="row">
          <span class="col-3">possess:</span>
          <span class="col-9">{{ numPossession }}</span>
        </div>
        <div class="row align-items-center">
          <span class="col-3">house:</span>
          <div class="input-group text-center col-9">
            <div class="input-group-prepend">
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="
                  !(cell.owner && isOwner && cell.owner === ownerId) ||
                    house <= -1
                "
                @click="house = Math.max(-1, house - 1)"
              >
                -
              </button>
            </div>
            <div class="form-control">{{ houseStatus }}</div>
            <div class="input-group-append">
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="
                  !(cell.owner && isOwner && cell.owner === ownerId) ||
                    house >= houseMax
                "
                @click="house = Math.min(houseMax, house + 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <!-- <input
          id="formControlRange"
          v-model="house"
          type="range"
          min="-1"
          :max="!cell.infra && isMonopoly ? '5' : '0'"
          class="form-control-range"
          :disabled="!(cell.owner && isOwner && cell.owner === ownerId)"
        /> -->
        <div v-if="cashToPay !== 0" class="row align-items-center">
          <div class="col-3">
            pay:
          </div>
          <div class="col-7">
            ${{ `${cashToPay} ${cellOwner.cash ? '/ ' + cellOwner.cash : ''}` }}
          </div>
        </div>
      </form>
    </div>
    <div v-else-if="cell.type === cellTypes.JAIL">
      <div v-for="key in uidsInJail" :key="key" class="row align-items-center">
        <div class="col-8">{{ users[key].username }}:</div>
        <div class="col-4">{{ users[key].jail }}</div>
      </div>
    </div>
    <div v-else-if="cell.type === cellTypes.ARREST">
      <form class="form-group" @submit.stop.prevent="submit">
        <div class="row align-items-center">
          <span class="col-3">suspect:</span>
          <div class="col-9">
            <select
              v-model="suspectUid"
              class="form-control"
              :disabled="!isOwner"
            >
              <template v-for="(user, key) in users">
                <option :key="key" :value="key">
                  {{ user.username }}
                </option>
              </template>
            </select>
          </div>
        </div>
      </form>
    </div>
    <template
      v-if="isChangeOwner || cashToPay !== 0 || suspectUid"
      v-slot:modal-ok
    >
      {{
        isChangeOwner
          ? 'delegate'
          : suspectUid
          ? 'send'
          : `${cashToPay > 0 ? 'pay' : 'get'} \$${Math.abs(cashToPay)}`
      }}
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { CellTypes, InfraTypes } from '../../static/ts/monopoly-cells'

export default Vue.extend({
  props: ['users', 'cells', 'cellIdx', 'hasAuth'],
  data: () => ({
    house: 0,
    ownerId: '',
    suspectUid: '',
    isLoading: false,
    cellTypes: CellTypes
  }),
  computed: {
    ...mapGetters('auth', ['uid']),
    cell() {
      return (this.cells ? this.cells[this.cellIdx] : {}) || {}
    },
    cellOwner() {
      return (
        (this.cell.type === CellTypes.HOUSE && this.users
          ? this.users[this.cell.owner]
          : {}) || {}
      )
    },
    rentPrice() {
      if (this.cell.type !== CellTypes.HOUSE || this.cell.house < 0) {
        return 0
      }
      switch (this.cell.infra) {
        case InfraTypes.RAILROAD:
          return this.cell.rent[Math.max(this.numPossession - 1, 0)]
        case InfraTypes.UTILITY:
          return `${this.cell.rent[Math.max(this.numPossession - 1, 0)]}x`
        default:
          return (
            this.cell.rent[this.cell.house] *
              (1 + (this.cell.house === 0 && this.isMonopoly)) || 0
          )
      }
    },
    sameColorCell() {
      return this.cells
        ? this.cells.filter(
            (c) => c.type === CellTypes.HOUSE && c.colorGroup === this.cell.colorGroup
          )
        : []
    },
    numPossession() {
      return this.cell.owner
        ? this.sameColorCell.filter((c) => c.owner === this.cell.owner).length
        : 0
    },
    isMonopoly() {
      return (
        !!this.cell.owner &&
        this.sameColorCell.every((c) => c.owner === this.cell.owner)
      )
    },
    houseStatus() {
      return this.house < 0 ? 'mortgage' : this.house > 4 ? 'hotel' : this.house
    },
    houseMax() {
      return !this.cell.infra && this.isMonopoly ? 5 : 0
    },
    isOwner() {
      return this.cell.owner === this.uid || this.hasAuth
    },
    isChangeOwner() {
      const nextOwner = this.ownerId !== 'nobody' ? this.ownerId : ''

      return nextOwner !== this.cell.owner
    },
    cashToPay() {
      const nextHouse = this.house
      const prevHouse = this.cell.house
      const diff = nextHouse - prevHouse
      if (diff === 0) return 0
      const build = this.cell.buildPrice || 0
      let ret = 0
      if (diff < 0) {
        ret = Math.round(
          (diff * build - (nextHouse < 0 ? this.cell.price - build : 0)) / 2
        )
      } else if (diff > 0) {
        ret = Math.round(
          diff * build +
            (prevHouse < 0 ? (this.cell.price * 1.1) / 2 - build : 0)
        )
      }
      return ret
    },
    uidsInJail() {
      const users = this.$props.users || {}
      return Object.keys(users).filter(i => users[i]?.jail > 0)
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('board', ['sendMessage', 'setCell', 'goToJail']),
    init() {
      this.reset()
      this.house = this.cell.house || 0
      this.ownerId = this.cell.owner || ''
    },
    reset() {
      this.house = 0
      this.ownerId = ''
    },
    checkEditability() {
      if (this.ownerId !== this.cell.owner) {
        this.house = this.cell.house
      }
    },
    async submit(ev) {
      ev.preventDefault()
      console.log(this.cell.type)
      switch (this.cell.type) {
        case CellTypes.HOUSE:
          await this.rentChange()
          break
        case CellTypes.ARREST:
          await this.toJail()
          break
        default:
          break
      }
      this.$nextTick(() => {
        this.$bvModal.hide('modal-cell-detail')
      })
    },
    async rentChange() {
      if (this.isLoading) return
      this.isLoading = true
      if (this.isChangeOwner || this.cashToPay !== 0) {
        const promises = []
        const nextOwner =
          this.ownerId && this.ownerId !== 'nobody' ? this.ownerId : ''

        if (nextOwner && nextOwner === this.cell.owner) {
          promises.push(
            this.setCell({ idx: this.cellIdx, cell: { house: +this.house } })
          )
          promises.push(
            this.sendMessage({
              from: this.cashToPay > 0 ? this.cell.owner : '',
              to: this.cashToPay > 0 ? '' : this.cell.owner,
              cash: Math.abs(this.cashToPay),
              message: `Building for ${this.cell.name}`
            })
          )
        } else {
          promises.push(
            this.setCell({ idx: this.cellIdx, cell: { owner: nextOwner } })
          )
        }
        await Promise.all(promises).catch(console.error)
      }
      this.isLoading = false
    },
    async toJail() {
      console.log(this.suspectUid)
      if (this.isLoading || !this.suspectUid) return
      this.isLoading = true
      await this.goToJail(this.suspectUid)
      this.suspectUid = ''
      this.isLoading = false
      this.$nextTick(() => {
        this.$bvModal.hide('modal-cell-detail')
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.form-group {
  .row {
    margin-bottom: 1em;
    :last-of-type {
      margin-bottom: 0;
    }
  }
}
.card {
  .card-header {
    padding: 0.5rem 1rem;
  }
  .card-body {
    padding: 0.75rem 1rem;
  }
}
</style>
