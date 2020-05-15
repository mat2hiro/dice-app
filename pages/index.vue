<template>
  <div class="container">
    <form>
      <div class="form-group">
        <input
          id="boardId"
          v-model="enterId"
          class="form-control"
          placeholder="Enter boardID"
        />
      </div>
      <button type="button" class="btn btn-primary" @click="enter">
        Enter
      </button>
    </form>

    <div>
      <p>Or Create New Board?</p>
      <form>
        <div class="form-group">
          <input
            v-model="newId"
            class="form-control"
            placeholder="New boardID"
          />
        </div>
        <button type="button" class="btn btn-primary" @click="create">
          Create
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
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
  methods: {
    async enter(ev) {
      const boardSnap = await db
        .collection('boards')
        .where('board_id', '==', this.enterId)
        .get()
      if (!boardSnap.empty) {
        boardSnap.forEach((bd) => this.$router.push(`/boards/${bd.id}`))
      }
    },
    async create() {
      const addedRef = await db.collection('boards').add({
        created_at: new Date(),
        is_active: true,
        board_id: this.newId,
        owner: this.$store.getters.uid
      })
      this.$router.push(`/boards/${addedRef.id}`)
    }
  }
})
</script>

<style lang="scss" scoped>
form {
  text-align: center;
  margin-bottom: 40px;
}
.form-group {
  width: 100%;
}
</style>
