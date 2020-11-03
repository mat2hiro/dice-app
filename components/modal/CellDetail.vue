<template>
  <b-modal
    id="modal-cell-detail"
    :title="cell.name"
    @show="init"
    @ok="submit"
    @hidden="reset"
  >
    <div v-if="cell.type === 0">
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
              <div class="card-body">${{ cell.build_price }}</div>
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
    <template v-if="isChangeOwner || cashToPay !== 0" v-slot:modal-ok>
      {{
        isChangeOwner
          ? 'delegate'
          : `${cashToPay > 0 ? 'pay' : 'get'} \$${Math.abs(cashToPay)}`
      }}
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  props: ['users', 'cells', 'cellIdx', 'hasAuth'],
  data: () => ({
    house: 0,
    ownerId: '',
    isLoading: false
  }),
  computed: {
    ...mapGetters('auth', ['uid']),
    cell() {
      return (this.cells ? this.cells[this.cellIdx] : {}) || {}
    },
    cellOwner() {
      return (
        (this.cell.type === 0 && this.users
          ? this.users[this.cell.owner]
          : {}) || {}
      )
    },
    rentPrice() {
      if (this.cell.type !== 0 || this.cell.house < 0) {
        return 0
      }
      if (this.cell.infra === 1) {
        return this.cell.rent[Math.max(this.numPossession - 1, 0)]
      } else if (this.cell.infra === 2) {
        return `${this.cell.rent[Math.max(this.numPossession - 1, 0)]}x`
      } else {
        return (
          this.cell.rent[this.cell.house] *
            (1 + (this.cell.house === 0 && this.isMonopoly)) || 0
        )
      }
    },
    sameColorCell() {
      return this.cells
        ? this.cells.filter(
            (c) => c.type === 0 && c.color_group === this.cell.color_group
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
      const build = this.cell.build_price || 0
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
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions('board', ['sendMessage', 'setCell']),
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
              timestamp: { created: new Date() },
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
