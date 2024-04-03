<script lang="ts" setup>
  defineEmits(['selectKlant'])

  const props = defineProps(['selectedKlant', 'klanten'])
</script>

<template>
  <div class="client-list-wrapper">
    <h3>Klantenlijst</h3>
    <ul class="client-list flex-col">
      <li v-for="klant in klanten" :key="klant.id" :class="props.selectedKlant === klant.id ? 'highlight' : ''">
        <div v-if="klant.id" @click="$emit('selectKlant', klant.id)">
          {{ `${klant.voornaam} ${klant.achternaam} - ${klant.emailadres}` }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .client-list-wrapper {
    margin-block: 3rem;
    flex: 1;
  }

  .client-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    margin-top: 2rem;
    max-height: 336px;
    overflow: auto;
    padding-right: 1rem;
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
