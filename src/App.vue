<script setup lang="ts">
  import Toast from 'primevue/toast'
  import { RouterView, useRoute } from 'vue-router'
  import UserProfile from './components/UserProfile.vue'

  const route = useRoute()
</script>

<template>
  <header v-if="route.name !== 'login' && route.name !== 'reset-password-request' && route.name !== 'reset-password' && route.name !== '404'">
    <div class="content container">
      <nav>
        <img src="./assets/images/wev_logo.svg" alt="logo" height="58" />

        <!-- <ul>
          <RouterLink to="/keuringen" :class="currentRoute.path.startsWith('/keuringen') ? 'current' : null">keuringen
          </RouterLink>
        </ul> -->
      </nav>
      <UserProfile />
    </div>
  </header>

  <RouterView />
  <Toast group="br" position="bottom-right" style="font-weight: bold" />
</template>

<style lang="scss">
  @import 'primevue/resources/themes/lara-light-green/theme.css';
  @import 'primeicons/primeicons.css';
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

  html {
    font-size: 10px;
  }

  body,
  ul,
  h1,
  h2,
  h3 {
    padding: 0;
    margin: 0;
  }

  table {
    th,
    td {
      font-size: 1.3rem;
    }
  }

  .container {
    max-width: 1300px;
    margin: 0 auto;
  }

  .hidden {
    display: none;
  }

  header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: #fff;

    .content {
      font-family: 'Rubik', sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100px;
      padding-block: 2rem;
    }
  }

  nav {
    display: flex;
    align-items: flex-end;
    gap: 50px;

    ul {
      display: flex;
      text-transform: uppercase;

      .current {
        border-bottom: 3px solid #000;
      }

      a {
        text-decoration: none;
        color: #000;
        border-bottom: 3px solid #fff;
        transition: all 0.3s ease;
        padding-block: 10px;

        &:hover {
          border-bottom: 3px solid #000;
        }
      }
    }
  }

  h1 {
    font-size: 2.4rem;
  }

  h2 {
    text-transform: uppercase;
    font-size: 1.5rem;
  }

  .column h2 {
    width: 150px;
  }

  h3 {
    font-size: 1.3rem;
  }

  .notificaties-wrapper {
    overflow: hidden;
    position: absolute;
    right: 2rem;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;

    li {
      list-style: none;
    }
  }

  .cancel,
  .confirm {
    color: #fff;
    padding: 1rem;
    font-family: 'Rubik', sans-serif;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .cancel {
    background-color: tomato;
  }

  .confirm {
    background-color: seagreen;

    &:disabled {
      background-color: lightgray;
      cursor: auto;
    }
  }

  .p-dialog-title {
    font-size: 1.6rem;
  }

  .p-dialog {
    font-size: 1.4rem;
  }

  .dp__main * {
    font-size: 1.2rem !important;
  }

  .dp__action_button {
    font-size: 1.2rem !important;
  }
</style>
