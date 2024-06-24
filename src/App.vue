<script setup lang="ts">
  import Toast from 'primevue/toast'
  import { RouterView, useRoute } from 'vue-router'
  import UserProfile from './components/UserProfile.vue'

  const route = useRoute()
</script>

<template>
  <header class="main-header" v-if="route.name !== 'login' && route.name !== 'reset-password-request' && route.name !== 'reset-password' && route.name !== '404'">
    <nav>
      <img src="./assets/images/wev_logo.svg" alt="logo" height="40" />
    </nav>
    <UserProfile />
  </header>

  <RouterView />
  <Toast group="br" position="bottom-right" />
</template>

<style lang="scss">
  @import 'primevue/resources/themes/lara-light-green/theme.css';
  @import 'primeicons/primeicons.css';
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  body,
  h1,
  h2,
  h3,
  ul {
    margin: 0;
    padding: 0;
  }

  input[type='radio'] {
    margin: 0;
    transform: scale(1.5);
    accent-color: seagreen;
    cursor: pointer;
    margin-left: 0.5rem;
  }

  input[type='checkbox'] {
    transform: scale(1.5);
    accent-color: seagreen;
    cursor: pointer;
  }

  .container {
    flex: 1;
  }

  .hidden {
    display: none;
  }

  .main-header {
    z-index: 11;
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 3rem;
    padding-block: 1rem;
    background-color: rgb(245, 245, 245);
    height: 70px;
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

  .p-dropdown-item > * {
    font-size: 0.9rem;
  }

  .text-xs {
    font-size: 0.75rem; //12px
    line-height: 1rem; //16px
  }

  .text-sm {
    font-size: 0.875rem; //14px
    line-height: 1.25rem; //20px
  }

  .text-base {
    font-size: 1rem; //16px
    line-height: 1.5rem; //24px
  }

  .text-lg {
    font-size: 1.125rem; //18px
    line-height: 1.75rem; //28px
  }

  .text-xl {
    font-size: 1.25rem; //20px
    line-height: 1.75rem; //28px
  }

  .text-2xl {
    font-size: 1.5rem; //24px
    line-height: 2rem; //32px
  }

  .text-3xl {
    font-size: 1.875rem; //30px
    line-height: 2.25rem; //36px
  }

  .red {
    color: crimson;
  }

  .clickable {
    cursor: pointer;
  }

  input {
    &:focus {
      box-shadow: none;
    }
  }
</style>
