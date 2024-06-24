<script setup lang="ts">
  import ClientList from '@/components/ClientList.vue'
  import { supabase } from '@/config/supabase'
  import { useAuthStore } from '@/stores/authStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import type { Klant } from '@/types'
  import { Icon } from '@iconify/vue'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'
  import InputWrapper from './form/InputWrapper.vue'

  const props = defineProps(['form'])
  const emits = defineEmits(['selectClient', 'closeSubForm'])

  const authStore = useAuthStore()
  const klantenStore = useKlantenStore()

  const form = ref<Klant>({
    id: '',
    voornaam: '',
    achternaam: '',
    emailadres: '',
    telefoonnummer: '',
    created_by: '',
    ...props.form
  })

  const isClientDuplicate = computed(() => {
    return (
      klantenStore.klanten.filter(
        (klant: Klant) =>
          klant.voornaam.toLowerCase() === form.value.voornaam.toLowerCase() &&
          klant.achternaam.toLowerCase() === form.value.achternaam.toLowerCase() &&
          klant.emailadres.toLowerCase() === form.value.emailadres.toLowerCase() &&
          klant.telefoonnummer === form.value.telefoonnummer
      ).length !== 0
    )
  })

  const addClient = async () => {
    const { data: uploadedKlant } = await supabase
      .from('klanten')
      .insert([
        {
          voornaam: form.value.voornaam,
          achternaam: form.value.achternaam,
          emailadres: form.value.emailadres,
          telefoonnummer: form.value.telefoonnummer,
          created_by: authStore.currentlyLoggedIn?.id
        }
      ])
      .select()

    if (uploadedKlant) {
      uploadedKlant.map((klant) => {
        klantenStore.addKlant({
          id: klant.id,
          voornaam: klant.voornaam,
          achternaam: klant.achternaam,
          emailadres: klant.emailadres,
          telefoonnummer: klant.telefoonnummer,
          created_by: klant.created_by
        })
        emits('selectClient', klant.id)
      })
    }
  }
</script>

<template>
  <section class="klant-form-wrapper">
    <div class="top-bar">
      <h2 class="text-2xl">Klant</h2>
      <Icon icon="mdi:close" width="24" class="clickable" @click="emits('closeSubForm')" />
    </div>
    <div class="content">
      <div class="form">
        <InputWrapper label="Voornaam" :showLabelFor="form.voornaam">
          <InputText size="small" class="text-xs" type="text" v-model="form.voornaam" id="voornaam" placeholder="Voornaam" />
        </InputWrapper>

        <InputWrapper label="Familienaam" :showLabelFor="form.achternaam">
          <InputText size="small" class="text-xs" type="text" v-model="form.achternaam" id="achternaam" placeholder="Familienaam" />
        </InputWrapper>

        <InputWrapper label="Emailadres" :showLabelFor="form.emailadres">
          <InputText size="small" class="text-xs" type="text" v-model="form.emailadres" id="emailadres" placeholder="Emailadres" />
        </InputWrapper>

        <InputWrapper label="Telefoonnummer" :showLabelFor="form.telefoonnummer">
          <InputText size="small" class="text-xs" type="text" v-model="form.telefoonnummer" id="telefoonnummer" placeholder="Telefoonnummer" />
        </InputWrapper>

        <div class="acties">
          <Button type="button" size="small" severity="success" :disabled="isClientDuplicate || !form.voornaam || !form.achternaam || !form.emailadres || !form.telefoonnummer" @click="addClient">
            Toevoegen
          </Button>
        </div>
      </div>
      <ClientList @selectKlant="(id: string) => emits('selectClient', id)" :formKlant="form" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .klant-form-wrapper {
    position: absolute;
    background-color: rgb(245, 245, 245);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 4rem;
    height: 600px;
    min-width: 800px;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    width: fit-content;
  }

  input {
    width: 100%;
    padding: 0.5rem;
  }

  label {
    color: grey;
    font-weight: 550;
  }

  .content {
    display: flex;
    gap: 3rem;
    margin-top: 1rem;
  }

  .form {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    button {
      margin-top: 1rem;
    }
  }

  :deep(.p-float-label) {
    flex: 1;
  }
</style>
