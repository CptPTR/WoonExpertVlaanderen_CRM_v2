<script lang="ts" setup>
  import type { Facturatie } from '@/types'
  import { Icon } from '@iconify/vue'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'

  defineEmits(['selectFacturatie'])
  const props = defineProps(['facturaties', 'keuringFacturatie'])

  const searchFac = ref<string>('')

  const filteredFacturaties = computed(() => {
    if (searchFac.value.length > 0) {
      return props.facturaties.filter((fac: Facturatie) => `${fac.voornaam} ${fac.achternaam} ${fac.emailadres}`.toLowerCase().includes(searchFac.value.toLowerCase()))
    }
    return props.facturaties
  })
</script>

<template>
  <div class="fac-list-wrapper">
    <div class="searchbar">
      <Icon icon="mdi:magnify" width="20" color="lightgrey" class="icon" />
      <InputText class="text-xs" type="text" v-model="searchFac" id="search_fac" placeholder="Zoek" />
    </div>
    <ul class="fac-list flex-col">
      <li v-for="fac in filteredFacturaties" :key="fac.id">
        <div v-if="!fac.organisatie" @click="$emit('selectFacturatie', fac.id)">
          <div class="name text-sm">{{ `${fac.voornaam} ${fac.achternaam}` }}</div>
          <div class="text-xs">{{ fac.emailadres }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .fac-list-wrapper {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .searchbar {
    display: flex;
    align-items: center;
    border-radius: 5px;
    transition: outline 0.2s ease;

    .icon {
      position: absolute;
      width: 35px;
    }

    input {
      width: 100%;
      background-color: #fff;
      border-radius: inherit;
      padding-left: 35px;
      padding-right: 16px;
      padding-block: 0.5rem;
    }
  }

  .fac-list {
    height: 375px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    overflow: auto;
  }

  li {
    background-color: #fff;
    border: 1px solid rgb(226, 232, 240);
    border-radius: 5px;

    > div {
      padding: 0.5rem 1rem;

      &:hover {
        background-color: seagreen;
        color: #fff;
      }
    }

    &:hover {
      border-color: seagreen;
    }

    &:hover:not(.highlight) {
      cursor: pointer;
    }
  }

  .highlight {
    border-color: seagreen;
    background-color: seagreen;
    color: #fff;
  }

  .name {
    font-weight: bold;
  }
</style>
