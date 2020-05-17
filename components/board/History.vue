<template>
  <div class="histories-container">
    <div class="row toggle-tab">
      <div
        class="col-6 col-md-3 text-center tab"
        :class="{ isActive: tabValue === 'dice' }"
        @click="tabValue = 'dice'"
      >
        Dice
      </div>
      <div
        class="col-6 col-md-3 text-center tab"
        :class="{ isActive: tabValue === 'message' }"
        @click="tabValue = 'message'"
      >
        Message
      </div>
      <div class="d-none d-md-flex col-md-6 tab-rest"></div>
    </div>
    <div v-if="tabValue === 'dice'" class="history-container">
      <p>History of dice roll</p>
      <div class="history-bordered">
        <div
          v-for="hist in history"
          :key="hist.time.getTime()"
          class="row history-row"
        >
          <div class="col-12 history-item">
            {{ hist.time ? displayTime(hist.time) : '' }}
            | {{ users[hist.uid] ? users[hist.uid].username : '' }} ::
            <span>{{ hist.value.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="tabValue === 'message'" class="history-container">
      <p>History of message</p>
      <div class="history-bordered">
        <div
          v-for="message in messages"
          :key="message.time.getTime()"
          class="row history-row"
        >
          <div class="col-12 history-item">
            {{ message.time ? displayTime(message.time) : 'Bank' }}
            |
            {{ users[message.from] ? users[message.from].username : 'Bank' }} ->
            {{ users[message.to] ? users[message.to].username : 'Bank' }}
            ::
            <span>{{ message.cash }}</span>
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
      return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
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
  }
}
</style>
