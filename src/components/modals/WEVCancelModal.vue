<script setup lang="ts">
  import Button from 'primevue/button'

  const emits = defineEmits(['close-window', 'confirm'])

  defineProps<{
    isOpen: boolean
  }>()

  const handleCancelClick = () => {
    emits('confirm')
  }

  const handleCloseButton = () => {
    emits('close-window')
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal">
      <div class="content">
        <h2 class="text-2xl">Annuleren bevestigen</h2>
        <p class="text-base">
          Weet je zeker dat je het formulier wilt annuleren? <br />
          Eventuele onopgeslagen wijzigingen zullen verloren gaan.
        </p>
        <div class="actions">
          <Button raised severity="danger" @click="handleCloseButton" class="text-sm">Sluit venster</Button>
          <Button type="submit" raised severity="success" @click="handleCancelClick" class="text-sm">Bevestig annulatie</Button>
        </div>
      </div>
    </div>

    <template v-else />
  </Teleport>
</template>

<style lang="scss" scoped>
  span {
    background-color: #e2e8f0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .modal {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    z-index: 1100;
    top: 0;
    left: 0;
    font-family: 'Rubik', sans-serif;

    .content {
      display: flex;
      flex-direction: column;
      width: 600px;
      gap: 20px;
      align-items: flex-start;
      border-radius: 5px;
      background-color: #fff;
      padding: 3rem;

      h2 {
        width: 100%;
      }

      ul {
        margin-block: 1rem;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding-left: 1rem;

        li {
          line-height: 1.6rem;
        }
      }

      .actions {
        align-self: flex-end;
        display: flex;
        gap: 7px;
        margin-top: 1rem;
      }
    }
  }
</style>
