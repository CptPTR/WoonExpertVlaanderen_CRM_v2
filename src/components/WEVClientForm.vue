<script setup lang="ts">
  import ClientList from '@/components/ClientList.vue'
  import { supabase } from '@/config/supabase'
  import { useKlantenStore } from '@/stores/klantenStore'
  import type { FormKeuring, Klant } from '@/types'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'

  const props = defineProps(['form'])
  const emits = defineEmits(['selectClient'])

  const klantenStore = useKlantenStore()

  const form = ref<FormKeuring>(props.form)

  const isClientDuplicate = computed(() => {
    return (
      klantenStore.klanten.filter(
        (klant: Klant) =>
          klant.voornaam === form.value.voornaam && klant.achternaam === form.value.familienaam && klant.emailadres === form.value.emailadres && klant.telefoonnummer === form.value.telefoonnummer
      ).length !== 0
    )
  })

  const selectKlant = (id: string) => {
    form.value.klantID = id
  }

  const addClient = async () => {
    const { data: uploadedKlant } = await supabase
      .from('klanten')
      .insert([
        {
          voornaam: form.value.voornaam,
          achternaam: form.value.familienaam,
          emailadres: form.value.emailadres,
          telefoonnummer: form.value.telefoonnummer
        }
      ])
      .select()

    if (uploadedKlant) {
      uploadedKlant.map((klant) => {
        emits('selectClient', klant.id)
        klantenStore.addKlant({
          id: klant.id,
          voornaam: klant.voornaam,
          achternaam: klant.achternaam,
          emailadres: klant.emailadres,
          telefoonnummer: klant.telefoonnummer
        })
      })
    }
  }
</script>

<template>
  <section class="klant">
    <h2>Klant</h2>
    <div class="content">
      <div class="form" style="width: 325px">
        <ul>
          <li>
            <InputText type="text" v-model="form.voornaam" placeholder="Voornaam" id="voornaam" />
            <InputText type="text" v-model="form.familienaam" placeholder="Achternaam" id="achternaam" />
          </li>
          <li>
            <InputText type="text" v-model="form.emailadres" placeholder="Emailadres" id="emailadres" />
          </li>
          <li>
            <InputText type="text" v-model="form.telefoonnummer" placeholder="Telefoonnummer" id="telefoonnummer" />
          </li>
        </ul>
        <div class="acties">
          <input type="button" value="Toevoegen" class="confirm" @click="addClient" :disabled="isClientDuplicate || !form.voornaam || !form.familienaam || !form.emailadres || !form.telefoonnummer" />
        </div>
      </div>
      <ClientList
        @selectKlant="selectKlant"
        :selectedKlant="form.klantID"
        :klanten="
          klantenStore.klanten
            .filter((klant: Klant) => klant.voornaam.toLowerCase().includes(form.voornaam.toLowerCase()))
            .filter((klant: Klant) => klant.achternaam.toLowerCase().includes(form.familienaam.toLowerCase()))
        "
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .klant {
    flex: 1;
    padding: 4.5rem;
    background-color: #fff;
    box-shadow:
      0 0 58px 0 rgba(0, 0, 0, 0.18),
      0 0 14px 0 rgba(0, 0, 0, 0.18);

    .content {
      display: flex;
      gap: 2.5rem;
    }
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-block: 3rem;

    li {
      display: flex;
      align-items: center;
      gap: 1rem;

      .p-dropdown {
        flex: 1;
      }
    }

    input {
      flex: 1;
      padding: 0.75rem;
    }
  }
</style>
