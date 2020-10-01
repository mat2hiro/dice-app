<template>
  <div class="container">
    <form @submit.stop.prevent="enter">
      <div class="form-group">
        <input
          id="boardName"
          v-model="enterId"
          class="form-control"
          placeholder="Enter boardID"
        />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="sending">
        Enter
      </button>
    </form>

    <div>
      <p>Or Create New Board?</p>
      <form @submit.stop.prevent="create">
        <div class="form-group">
          <input
            v-model="newId"
            class="form-control"
            placeholder="New boardID"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          Create
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import firebase from '~/plugins/firebase'

import { boardCellsData } from '~/static/ts/monopoly-cells.ts'

const db = firebase.firestore()

export default Vue.extend({
  data() {
    return {
      enterId: '',
      notExists: false,
      newId: '',
      alreadyExists: false,
      sending: false
    }
  },
  computed: {
    ...mapState('auth', ['uid'])
  },
  methods: {
    async enter(ev) {
      this.sending = true
      try {
        const boardSnap = await db
          .collection('boards')
          .where('boardName', '==', this.enterId)
          .get()
        if (!boardSnap.empty) {
          boardSnap.forEach((bd) => this.$router.push(`/boards/${bd.id}`))
        }
      } catch (e) {
        console.error(e)
      }
      this.sending = false
    },
    async create(ev) {
      if (!this.newId) return
      this.sending = true
      try {
        const now = new Date()
        const addedRef = await db.collection('boards').add({
          timestamp: {
            created: now
          },
          isActive: true,
          boardName: this.newId,
          owner: this.uid
        })
        await Promise.all(
          boardCellsData.map((cell, idx) =>
            db
              .collection('boards')
              .doc(addedRef.id)
              .collection('cells')
              .doc('' + idx)
              .set({
                ...cell,
                owner: '',
                house: 0,
                timestamp: { updated: now }
              })
          )
        )
        this.$router.push(`/boards/${addedRef.id}`)
      } catch (e) {
        console.error(e)
      }

      this.sending = false
    }
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding-top: 40px;
  padding-bottom: 40px;
}
form {
  text-align: center;
  margin-bottom: 40px;
}
.form-group {
  width: 100%;
}
</style>
