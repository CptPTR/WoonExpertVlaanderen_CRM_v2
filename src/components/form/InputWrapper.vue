<script setup lang="ts">
  const props = defineProps(['label', 'showLabelFor'])
</script>

<template>
  <div class="input-wrapper">
    <label for="straatnaam" v-if="props.showLabelFor">{{ props.label }}</label>
    <slot />
  </div>
</template>

<style scoped lang="scss">
  .input-wrapper {
    position: relative;

    label {
      z-index: 20;
      color: grey;
      position: absolute;
      top: -8px;
      left: 5px;
      background-color: rgb(245, 245, 245);
      border-radius: 10px;
      padding-inline: 5px;
      line-height: 0.9rem;
      font-size: 0.6rem;
      color: seagreen;
      font-weight: bold;
    }

    .full-w {
      width: 100%;
    }
  }
</style>
