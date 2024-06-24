<script setup lang="ts">
  import { Icon } from '@iconify/vue'
</script>

<template>
  <span class="back-btn">
    <Icon icon="mdi:arrow-left" width="32" />
  </span>
</template>

<style scoped lang="scss">
  .back-btn {
    display: flex;
    margin-right: 2rem;
    border-radius: 15px;
    cursor: pointer;

    &:hover {
      background-color: #e2e8f0;
    }
  }
</style>
