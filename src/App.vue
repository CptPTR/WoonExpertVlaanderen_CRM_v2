<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router';
import UserProfile from './components/UserProfile.vue';

const { currentRoute } = useRouter();
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
</template>

<style lang="scss">
@import 'primevue/resources/themes/lara-light-green/theme.css';
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  font-size: 10px;
}

body,
ul,
h1,
h2 {
  padding: 0;
  margin: 0;
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
    gap: 20px;
    text-transform: uppercase;
    margin: 0;
    padding: 0;

    .current {
      border-bottom: 3px solid #000;
    }

    a {
      font-size: 1.3rem;
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

p {
  padding: 0;
  margin: 0;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  text-transform: uppercase;
  font-size: 1.4rem;
}

.column h2 {
  width: 150px;
}

h3 {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  width: 75px;
  margin: 0;
}

.dp__main * {
  font-size: 1.2rem !important;
}

.dp__action_button {
  font-size: 1.2rem !important;
}

@keyframes progress {
  0% {
    transform: translate3d(-100%, 0, 0);
  }

  100% {
    transform: translate3d(100%, 0, 0);
  }
}
</style>
