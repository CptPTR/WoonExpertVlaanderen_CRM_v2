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
    <h1>404</h1>
    <p>Oeps, deze pagina bestaat niet!</p>
    <Button @click="handleClick" size="large"> Terug naar homepagina </Button>
  </div>
</template>

<style lang="scss" scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5rem;
    align-items: center;
    height: 100vh;

    h1 {
      font-size: 10rem;
    }

    p {
      font-size: 2rem;
    }
  }
</style>
