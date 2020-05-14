<template>
  <footer>
    <nav>
      <ul>
        <li><nuxt-link to="/board">BOARD</nuxt-link></li>
        <li><nuxt-link to="/status">STATUS</nuxt-link></li>
      </ul>
    </nav>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  height: 60px;
  width: 100%;
  padding: 0 2rem;
  position: fixed;
  bottom: 0;
  border-top: 2px solid #ccc;
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  ul {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 60px;
  }
}
</style>
