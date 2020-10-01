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
          <span class="col-2">price:</span>
          <span class="col-10">${{ cell.price }}</span>
        </div>
        <div class="row align-items-center">
          <span class="col-2">owner:</span>
          <div class="col-10">
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
        <div class="row align-items-center">
          <span class="col-2">build:</span>
          <span class="col-10">${{ cell.build_price }}</span>
        </div>
        <div class="row align-items-center">
          <span class="col-2">rent:</span>
          <span class="col-10">${{ rentPrice }}</span>
        </div>

        <label class="row" for="formControlRange">
          <span class="col-2">house:</span>
          <span class="col-10">{{ houseStatus }}</span>
        </label>
        <input
          id="formControlRange"
          v-model="house"
          type="range"
          min="-1"
          :max="isMonopoly ? '5' : '0'"
          class="form-control-range"
          :disabled="!(cell.owner && isOwner && cell.owner === ownerId)"
        />
        <div v-if="cashToPay !== 0" class="row align-items-center">
          <div class="col-2">
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
    house: '',
    ownerId: ''
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
      return this.cell.type !== 0 || this.cell.house < 0
        ? 0
        : this.cell.rent[this.cell.house] *
            (1 + (this.cell.house === 0 && this.isMonopoly))
    },
    isMonopoly() {
      return (
        this.cells &&
        this.cells
          .filter(
            (c) => c.type === 0 && c.color_group === this.cell.color_group
          )
          .every((c) => c.owner === this.cell.owner)
      )
    },
    houseStatus() {
      return this.house < 0 ? 'mortage' : this.house > 4 ? 'hotel' : this.house
    },
    isOwner() {
      return this.cell.owner === this.uid || this.hasAuth
    },
    isChangeOwner() {
      const nextOwner = this.ownerId !== 'nobody' ? this.ownerId : ''

      return nextOwner !== this.cell.owner
    },
    cashToPay() {
      if (!this.house) return 0
      const nextHouse = +this.house
      const prevHouse = this.cell.house
      const diff = nextHouse - prevHouse
      let ret = 0
      if (diff < 0) {
        ret = Math.round(
          (diff * this.cell.build_price -
            (nextHouse < 0 ? this.cell.price - this.cell.build_price : 0)) /
            2
        )
      } else if (diff > 0) {
        ret = Math.round(
          diff * this.cell.build_price +
            (prevHouse < 0
              ? (this.cell.price * 1.1) / 2 - this.cell.build_price
              : 0)
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
      this.house = '' + this.cell.house || ''
      this.ownerId = this.cell.owner || ''
    },
    reset() {
      this.house = ''
      this.ownerId = ''
    },
    checkEditability() {
      if (this.ownerId !== this.cell.owner) {
        this.house = this.cell.house
      }
    },
    async submit(ev) {
      ev.preventDefault()
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
        await Promise.all(promises)
      }
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
</style>
