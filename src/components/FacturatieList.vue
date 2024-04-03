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
    <h3>Facturatielijst</h3>
    <ul class="fac-list flex-col">
      <div class="searchbar">
        <Icon icon="mdi:magnify" width="16" color="lightgrey" class="icon" />
        <InputText type="text" v-model="searchFac" id="search_fac" placeholder="Zoek" />
      </div>

      <li v-for="fac in filteredFacturaties" :key="fac.id">
        <div v-if="!fac.organisatie" @click="$emit('selectFacturatie', fac.id)">
          {{ `${fac.voornaam} ${fac.achternaam} - ${fac.emailadres}` }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .searchbar {
    display: flex;
    align-items: center;
    border: 1px solid lightgrey;
    border-radius: 5px;
    transition: outline 0.2s ease;

    &:focus-within {
      border: 1px solid #000;
    }

    .icon {
      position: absolute;
      width: 35px;
    }

    input {
      width: 100%;
      padding: 1rem;
      background-color: #fff;
      border-radius: inherit;
      outline: none;
      border: none;
      padding-left: 35px;
      padding-right: 16px;
    }
  }

  .fac-list-wrapper {
    flex: 1;
  }

  .fac-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    margin-top: 2rem;
  }

  li {
    border: 1px solid #000;
    border-radius: 5px;

    > div {
      padding: 1rem;
      font-size: 1.1rem;

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
</style>
