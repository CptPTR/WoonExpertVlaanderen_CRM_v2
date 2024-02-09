<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import UserProfile from './components/UserProfile.vue';
import WEVNotificatie from './components/WEVNotificatie.vue';

const route = useRoute();
</script>

<template>
  <header v-if="route.name !== 'login'">
    <div class="content container">
      <nav>
        <img src="./assets/images/wev_logo.svg" alt="logo" height="58">

        <!-- <ul>
          <RouterLink to="/keuringen" :class="currentRoute.path.startsWith('/keuringen') ? 'current' : null">keuringen
          </RouterLink>
        </ul> -->
      </nav>
      <UserProfile />
    </div>
  </header>

  <RouterView />
  <WEVNotificatie message="Keuring succesvol aangemaakt!" />
</template>

<style lang="scss">
@import 'primevue/resources/themes/lara-light-green/theme.css';
@import 'primeicons/primeicons.css';
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

html {
  font-size: 62.5%;
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
    font-family: "Rubik", sans-serif;
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
  font-size: 2.5rem;
}

h2 {
  text-transform: uppercase;
  font-size: 1.6rem;
}

.column h2 {
  width: 150px;
}

h3 {
  font-size: 1.4rem;
}

.dialog {
  .p-dialog-header {
    padding: 3rem;

    span,
    div {
      // font-size: 1.8rem;
    }

    button {
      width: 30px;
      height: 30px;
    }

    svg {
      width: 1.4rem;
      height: 1.4rem;
    }
  }

  .p-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding-inline: 3rem;

    p {
      // font-size: 1.4rem;
    }

    button {
      align-self: flex-end;

      span {
        // font-size: 1.4rem;
      }
    }
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

.dp__main * {
  font-size: 1.2rem !important;
}

.dp__action_button {
  font-size: 1.2rem !important;
}
</style>
