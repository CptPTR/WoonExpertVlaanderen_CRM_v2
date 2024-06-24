<script setup lang="ts">
  import { supabase } from '@/config/supabase'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import { Icon } from '@iconify/vue'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import { ref } from 'vue'

  const props = defineProps(['facturatie', 'open'])
  const emits = defineEmits(['closeModal'])

  const editableFacturatie = ref({
    ...props.facturatie
  })

  const vlaamseStedenStore = useVlaamseStedenStore()
  const facturatiesStore = useFacturatiesStore()

  const handleClick = () => {
    emits('closeModal')
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const { error } = await supabase
      .from('facturaties')
      .update({
        voornaam: editableFacturatie.value.voornaam,
        achternaam: editableFacturatie.value.achternaam,
        emailadres: editableFacturatie.value.emailadres,
        telefoonnummer: editableFacturatie.value.telefoonnummer,
        vlaamse_stad_ID: editableFacturatie.value.vlaamse_stad_ID,
        straatnaam: editableFacturatie.value.straatnaam,
        nummer: editableFacturatie.value.nummer,
        busnummer: editableFacturatie.value.busnummer
      })
      .eq('id', editableFacturatie.value.id)

    if (error) {
      console.error('Error updating facturatie: ', error)
      return
    }
    facturatiesStore.editFacturatie(editableFacturatie.value.id, editableFacturatie.value)
    emits('closeModal')
  }
</script>
<template>
  <div v-if="props.open" class="modal">
    <div class="window">
      <header>
        <h3>Facturatiegegevens</h3>
        <Icon icon="mdi:close" width="22" class="clickable" color="gray" @click="handleClick" />
      </header>
      <form @submit="handleSubmit">
        <InputText class="text-xs" type="text" id="voornaam" size="small" placeholder="Voornaam" variant="filled" v-model="editableFacturatie.voornaam" />

        <InputText class="text-xs" type="text" id="familienaam" size="small" placeholder="Familienaam" variant="filled" v-model="editableFacturatie.achternaam" />

        <InputText class="text-xs grid-item-2" type="text" id="emailadres" size="small" placeholder="Emailadres" variant="filled" v-model="editableFacturatie.emailadres" />

        <InputText class="text-xs grid-item-2" type="text" id="telefoonnummer" size="small" placeholder="Telefoonnummer" variant="filled" v-model="editableFacturatie.telefoonnummer" />

        <Dropdown
          resetFilterOnHide
          filter
          v-model="editableFacturatie.vlaamse_stad_ID"
          variant="filled"
          :virtual-scroller-options="{ itemSize: 38 }"
          :options="vlaamseStedenStore.vlaamse_steden"
          optionLabel="gemeente"
          optionValue="id"
          inputId="fac_gemeente"
          placeholder="Gemeente"
          class="grid-item-2"
        />

        <InputText class="text-xs grid-item-2" type="text" id="straatnaam" size="small" placeholder="Straatnaam" variant="filled" v-model="editableFacturatie.straatnaam" />
        <InputText class="text-xs" type="text" id="nummer" size="small" placeholder="Nummer" variant="filled" v-model="editableFacturatie.nummer" />
        <InputText class="text-xs" type="text" id="busnummer" size="small" placeholder="Busnummer" variant="filled" v-model="editableFacturatie.busnummer" />
        <Button size="small" class="grid-item-2" type="submit">
          <Icon icon="mdi:pencil" width="16" />
          Wijzigen
        </Button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  svg:hover {
    color: black !important;
  }

  .modal {
    position: fixed;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .window {
    background-color: #fff;
    width: fit-content;
    padding: 2rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  form {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    .grid-item-2 {
      grid-column: 1 / 3;
    }

    button {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
  }

  :deep(.p-inputtext) {
    font-size: 0.75rem;
  }
</style>
