<script lang="ts" setup>
  import { useAuthStore } from '@/stores/authStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import type { Klant } from '@/types'
  import { computed } from 'vue'

  const props = defineProps(['formKlant'])
  const emits = defineEmits(['selectKlant'])

  const klantenStore = useKlantenStore()
  const authStore = useAuthStore()

  const filteredClients = computed(() => {
    return klantenStore.klanten.filter(
      (klant: Klant) =>
        `${klant.voornaam.toLowerCase()} ${klant.achternaam.toLowerCase()}`.includes(props.formKlant.voornaam.toLowerCase()) &&
        `${klant.voornaam.toLowerCase()} ${klant.achternaam.toLowerCase()}`.includes(props.formKlant.achternaam.toLowerCase()) &&
        klant.emailadres.toLowerCase().includes(props.formKlant.emailadres.toLowerCase()) &&
        klant.telefoonnummer.includes(props.formKlant.telefoonnummer) &&
        klant.created_by === authStore.currentlyLoggedIn?.id
    )
  })
</script>

<template>
  <div class="client-list-wrapper" v-if="klantenStore.klanten.length !== 0">
    <h3 class="text-base">Gevonden klanten</h3>
    <ul class="client-list">
      <li v-for="klant in filteredClients" :key="klant.id">
        <div v-if="klant.id" @click="emits('selectKlant', klant.id)">
          <div class="name text-sm">{{ `${klant.voornaam} ${klant.achternaam}` }}</div>
          <div class="text-xs">{{ klant.emailadres }}</div>
        </div>
      </li>
    </ul>
  </div>
  <div class="empty" v-else>
    <h3 class="text-base">Geen klanten gevonden in het systeem</h3>
  </div>
</template>

<style lang="scss" scoped>
  .empty {
    flex: 3;
  }

  .client-list-wrapper {
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .client-list {
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

  .name {
    font-weight: bold;
  }
</style>
