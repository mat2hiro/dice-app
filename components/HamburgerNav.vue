<template>
  <div id="nav-drawer">
    <input id="nav-input" type="checkbox" class="nav-unshown" />
    <label class="nav-open" for="nav-input"><span></span></label>
    <label class="nav-close nav-unshown" for="nav-input"></label>
    <div id="nav-content">
      <div class="nav-header">
        <label class="close-input" for="nav-input"></label>
      </div>
      <div class="nav-main container">
        <div class="row">
          <div class="col-12">your name</div>
          <input
            :value="username"
            class="form-control col-12"
            @input="(ev) => setUserName(ev)"
          />
        </div>
      </div>
      <div class="nav-footer container">
        <ul>
          <li>
            <nuxt-link to="/signout" class="btn btn-secondary"
              >Sign out</nuxt-link
            >
          </li>
          <li><nuxt-link to="/terms/privacy">Privacy Policy</nuxt-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapGetters('auth', ['username', 'uid'])
  },
  mounted() {
    this.name = this.username
  },
  methods: {
    ...mapActions('auth', ['updateUserName']),
    setUserName(event) {
      this.updateUserName({ uid: this.uid, userName: event.target.value })
    }
  }
})
</script>

<style lang="scss" scoped>
#nav-drawer {
  position: relative;
}

.nav-unshown {
  display: none;
}

.nav-open {
  display: inline-block;
  width: 25px;
  height: 20px;
  vertical-align: middle;
  margin: auto;
}

.nav-open span,
.nav-open span:before,
.nav-open span:after {
  position: absolute;
  height: 3px;
  width: 25px;
  border-radius: 3px;
  background: #555;
  display: block;
  content: '';
  cursor: pointer;
}
.nav-open span:before {
  bottom: -8px;
}
.nav-open span:after {
  bottom: -16px;
}

.close-input {
  cursor: pointer;
  position: relative;
  width: 25px;
  height: 20px;
  &::before,
  &::after {
    content: '';
    width: 25px;
    height: 3px;
    background: #555;
    border-radius: 3px;
    position: absolute;
    top: 10px;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(135deg);
  }
}

.nav-close {
  display: none;
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  opacity: 0;
  transition: 0.3s ease-in-out;
}

/*中身*/
#nav-content {
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 90%;
  max-width: 330px;
  height: 100%;
  background: #fff;
  transition: 0.3s ease-in-out;
  transform: translateX(100vw);
}

.nav-header {
  height: 60px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: 575px) {
    padding: 0 15px;
  }
}

.nav-main {
  margin-bottom: 1em;
}

.nav-footer {
  button {
    margin-bottom: 1em;
    display: block;
  }
}

ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  margin-bottom: 1em;
}

/*チェックが入ったらもろもろ表示*/
#nav-input:checked ~ .nav-close {
  display: block;
  opacity: 0.5;
}

#nav-input:checked ~ #nav-content {
  transform: translateX(calc(100vw - 100%));
  box-shadow: 6px 0 25px rgba(0, 0, 0, 0.15);
}
</style>
