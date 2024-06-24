<script setup lang="ts">
  import Button from 'primevue/button'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const handleClick = () => {
    router.push('/')
  }
</script>

<template>
  <div class="container not-found">
    <div class="text">
      <h1 class="text-3xl">404</h1>
      <p class="text-lg">Oeps, deze pagina bestaat niet!</p>
    </div>
    <Button class="text-base" @click="handleClick" size="large">Terug naar homepagina</Button>
  </div>
</template>

<style lang="scss" scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    align-items: center;
    height: 100vh;

    .text {
      text-align: center;
    }
  }
</style>
