<template>
  <div class="histories-container">
    <div class="row toggle-tab">
      <div
        class="col-6 text-center tab"
        :class="{ isActive: tabValue === 'dice' }"
        @click="tabValue = 'dice'"
      >
        Dice
      </div>
      <div
        class="col-6 text-center tab"
        :class="{ isActive: tabValue === 'message' }"
        @click="tabValue = 'message'"
      >
        Message
      </div>
      <div class="d-none tab-rest"></div>
    </div>
    <div v-if="tabValue === 'dice'" class="history-container">
      <p>History of dice roll</p>
      <div class="history-bordered">
        <div
          v-for="hist in history"
          :key="hist.time.getTime()"
          class="row history-row"
        >
          <div class="col-12 history-item d-flex">
            <span class="time">
              {{ hist.time ? displayTime(hist.time) : '' }} |
            </span>
            <span class="msg">
              {{ users[hist.uid] ? users[hist.uid].username : '' }} ::
              <span class="text-nowrap">{{ hist.value.join(', ') }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="tabValue === 'message'" class="history-container">
      <p>History of message</p>
      <div class="history-bordered">
        <div
          v-for="message in messages"
          :key="message.timestamp.created.getTime()"
          class="row history-row"
        >
          <div class="col-12 history-item d-flex">
            <span class="time">
              {{ displayTime(message.timestamp.created) }} |
            </span>
            <span class="msg">
              {{ users[message.from] ? users[message.from].username : 'Bank' }}
              ->
              {{ users[message.to] ? users[message.to].username : 'Bank' }}
              ::
              <span>{{ message.cash }}</span>
              <br />
              <span>{{ message.message }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['history', 'messages', 'users'],
  data: () => ({
    tabValue: 'dice'
  }),
  computed: {
    displayTime: () => (time) => {
      return `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes()
      ).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
    }
  }
})
</script>

<style lang="scss" scoped>
.toggle-tab {
  padding: 0 15px;
  .tab {
    cursor: pointer;
    line-height: 3em;
    background: #eee;
    border: 1px solid #eee;
    border-bottom: 1px solid #ccc;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    transition: background-color 0.15s ease-in-out;
    &:hover {
      background: #e5e5e5;
    }
    &.isActive {
      background: #fff;
      border-color: #ccc;
      border-bottom: 0;
    }
  }
  .tab-rest {
    border-bottom: 1px solid #ccc;
  }
}
.histories-container {
  margin-top: 2em;
}
.history-container {
  > p {
    padding: 0 2em;
    padding-bottom: 0.5em;
  }
  .history-bordered {
    padding: 0.5em 1em;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-y: auto;
    max-height: 500px;
  }
  .history-row {
    width: 100%;
    padding: 0.5em 0;
    margin: 0;
    border-bottom: 1px solid #eee;
    .history-item {
      flex-wrap: nowrap;
      .time {
        flex-shrink: 0;
        width: 5em;
      }
    }
  }
}
</style>
