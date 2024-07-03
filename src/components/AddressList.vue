<script lang="ts" setup>
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useAuthStore } from '@/stores/authStore'
  import type { Adres } from '@/types'
  import { computed } from 'vue'

  const props = defineProps(['formAdres'])
  const emits = defineEmits(['selectAdres'])

  const authStore = useAuthStore()
  const adressenStore = useAdressenStore()

  const filteredAdressen = computed(() => {
    return adressenStore.adressen.filter(
      (adres: Adres) =>
        `${adres.straatnaam.toLowerCase()} ${adres.nummer}`.includes(`${props.formAdres.straatnaam.toLowerCase()}`) &&
        `${adres.straatnaam.toLowerCase()} ${adres.nummer}`.includes(`${props.formAdres.nummer}`) &&
        adres.vlaamse_stad_ID === props.formAdres.vlaamse_stad_ID &&
        adres.created_by === authStore.currentlyLoggedIn?.id
    )
  })
</script>

<template>
  <div class="address-list-wrapper" v-if="adressenStore.adressen.length !== 0">
    <h3 class="text-base">Gevonden adressen</h3>
    <ul class="address-list">
      <li v-for="adres in filteredAdressen" :key="adres.id">
        <div class="text-sm" v-if="adres.id" @click="emits('selectAdres', adres.id)">
          {{ `${adres.straatnaam} ${adres.nummer}` }}
          {{ adres.busnummer ? adres.busnummer : '' }}
        </div>
      </li>
    </ul>
  </div>
  <div class="empty" v-else>
    <h3 class="text-base">Geen adressen gevonden in het systeem</h3>
  </div>
</template>

<style lang="scss" scoped>
  .empty {
    flex: 3;
  }

  .address-list-wrapper {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .address-list {
    max-height: 350px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    overflow: auto;
    padding-right: 0.5rem;
  }

  li {
    background-color: #fff;
    border: 1px solid rgb(226, 232, 240);
    border-radius: 5px;

    > div {
      padding: 0.6rem 1rem;
    }

    &:hover {
      cursor: pointer;
      background-color: seagreen;
      border-color: seagreen;
      color: #fff;
    }
  }

  .highlight {
    border-color: seagreen;
    background-color: seagreen;
    color: #fff;
  }
</style>
