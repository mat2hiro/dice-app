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
      <button type="submit" class="btn btn-primary">
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
        <button type="submit" class="btn btn-primary">
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

const db = firebase.firestore()

export default Vue.extend({
  data() {
    return {
      enterId: '',
      notExists: false,
      newId: '',
      alreadyExists: false
    }
  },
  computed: {
    ...mapState('auth', ['uid'])
  },
  methods: {
    async enter(ev) {
      const boardSnap = await db
        .collection('boards')
        .where('boardName', '==', this.enterId)
        .get()
      if (!boardSnap.empty) {
        boardSnap.forEach((bd) => this.$router.push(`/boards/${bd.id}`))
      }
    },
    async create(ev) {
      if (!this.newId) return
      const addedRef = await db.collection('boards').add({
        timestamp: {
          created: new Date()
        },
        isActive: true,
        boardName: this.newId,
        owner: this.uid
      })
      this.$router.push(`/boards/${addedRef.id}`)
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
