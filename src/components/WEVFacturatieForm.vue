<script setup lang="ts">
  import FacturatieList from '@/components/FacturatieList.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import { useAuthStore } from '@/stores/authStore'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Facturatie, FormKeuring } from '@/types'
  import { Icon } from '@iconify/vue'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import FloatLabel from 'primevue/floatlabel'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'

  const props = defineProps(['form', 'klanten', 'adressen', 'keuringClient', 'keuringAddress'])
  const emits = defineEmits(['selectFacturatie', 'closeSubForm'])

  const authStore = useAuthStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const facturatiesStore = useFacturatiesStore()

  const form = ref<FormKeuring>(props.form)
  const keuringFacturatie = ref<Facturatie>({ ...props.keuringAddress, ...props.keuringClient })

  const isFacturatieDuplicate = computed(() => {
    return (
      facturatiesStore.facturaties.filter(
        (fac: Facturatie) =>
          fac.voornaam === keuringFacturatie.value.voornaam &&
          fac.achternaam === keuringFacturatie.value.achternaam &&
          fac.emailadres === keuringFacturatie.value.emailadres &&
          fac.telefoonnummer === keuringFacturatie.value.telefoonnummer &&
          fac.straatnaam === keuringFacturatie.value.straatnaam &&
          fac.nummer === keuringFacturatie.value.nummer &&
          fac.busnummer === keuringFacturatie.value.busnummer &&
          fac.vlaamse_stad_ID === keuringFacturatie.value.vlaamse_stad_ID &&
          fac.created_by === keuringFacturatie.value.created_by
      ).length !== 0
    )
  })

  const addFacturatie = async () => {
    const { data: uploadedFacturatie } = await supabase
      .from('facturaties')
      .insert([
        {
          voornaam: keuringFacturatie.value.voornaam,
          achternaam: keuringFacturatie.value.achternaam,
          emailadres: keuringFacturatie.value.emailadres,
          telefoonnummer: keuringFacturatie.value.telefoonnummer,
          straatnaam: keuringFacturatie.value.straatnaam,
          nummer: keuringFacturatie.value.nummer,
          busnummer: keuringFacturatie.value.busnummer,
          organisatieID: null,
          vlaamse_stad_ID: keuringFacturatie.value.vlaamse_stad_ID,
          created_by: keuringFacturatie.value.created_by
        }
      ])
      .select('*')

    if (uploadedFacturatie) {
      uploadedFacturatie.map((fac) => {
        emits('selectFacturatie', fac.id)

        facturatiesStore.addFacturatie({
          id: fac.id,
          voornaam: fac.voornaam,
          achternaam: fac.achternaam,
          emailadres: fac.emailadres,
          telefoonnummer: fac.telefoonnummer,
          straatnaam: fac.straatnaam,
          nummer: fac.nummer,
          busnummer: fac.busnummer,
          organisatie: null,
          vlaamse_stad_ID: fac.vlaamse_stad_ID,
          created_by: fac.created_by
        })
      })
    }
  }
</script>

<template>
  <section class="facturatie-form-wrapper">
    <div class="top-bar">
      <h2 class="text-lg">Facturatie</h2>
      <Icon icon="mdi:close" width="24" class="close-sub-form" @click="emits('closeSubForm')" />
    </div>
    <div class="form">
      <ul>
        <li>
          <FloatLabel>
            <label class="text-xs" for="fac_voornaam">Voornaam</label>
            <InputText class="text-xs" type="text" v-model="keuringFacturatie.voornaam" id="fac_voornaam" required />
          </FloatLabel>
          <FloatLabel>
            <label class="text-xs" for="fac_familienaam">Familienaam</label>
            <InputText class="text-xs" type="text" v-model="keuringFacturatie.achternaam" id="fac_familienaam" required />
          </FloatLabel>
        </li>
        <li>
          <FloatLabel>
            <label class="text-xs" for="fac_emailadres">Emailadres</label>
            <InputText class="text-xs" type="email" v-model="keuringFacturatie.emailadres" id="fac_emailadres" required />
          </FloatLabel>
        </li>
        <li>
          <FloatLabel>
            <label class="text-xs" for="fac_telefoonnummer">Telefoonnummer</label>
            <InputText class="text-xs" type="tel" v-model="keuringFacturatie.telefoonnummer" id="fac_telefoonnummer" pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}" required />
          </FloatLabel>
        </li>
        <li v-if="keuringFacturatie.vlaamse_stad_ID">
          <FloatLabel>
            <label class="text-xs" for="fac_gemeente">Gemeente</label>
            <Dropdown
              resetFilterOnHide
              filter
              v-model="keuringFacturatie.vlaamse_stad_ID"
              :virtual-scroller-options="{ itemSize: 38 }"
              :options="vlaamseStedenStore.vlaamse_steden"
              optionLabel="gemeente"
              optionValue="id"
              inputId="fac_gemeente"
              placeholder="Gemeente"
            />
          </FloatLabel>
        </li>
        <li>
          <FloatLabel>
            <label class="text-xs" for="fac_straatnaam">Straatnaam</label>
            <InputText class="text-xs" type="text" v-model="keuringFacturatie.straatnaam" id="fac_straatnaam" required />
          </FloatLabel>
        </li>
        <li>
          <FloatLabel>
            <label class="text-xs" for="fac_nummer">Nr</label>
            <InputText class="text-xs" type="text" v-model="keuringFacturatie.nummer" id="fac_nummer" maxlength="10" required />
          </FloatLabel>
          <FloatLabel>
            <label class="text-xs" for="fac_busnummer">Busnr</label>
            <InputText class="text-xs" type="text" v-model="keuringFacturatie.busnummer" id="fac_busnummer" maxlength="10" required />
          </FloatLabel>
        </li>
        <li>
          <div class="acties" v-if="form.facturatie_bestemming === FacturatieBestemming.ANDERS">
            <Button
              type="button"
              raised
              severity="success"
              :disabled="
                isFacturatieDuplicate ||
                !keuringFacturatie.voornaam ||
                !keuringFacturatie.achternaam ||
                !keuringFacturatie.emailadres ||
                !keuringFacturatie.telefoonnummer ||
                !keuringFacturatie.straatnaam ||
                !keuringFacturatie.nummer ||
                !keuringFacturatie.vlaamse_stad_ID
              "
              @click="addFacturatie"
              class="text-sm"
            >
              Toevoegen
            </Button>
          </div>
        </li>
      </ul>
      <FacturatieList
        @select-facturatie="(id: string) => emits('selectFacturatie', id)"
        :selectedFacturatie="form.facturatieID"
        :keuringFacturatie="keuringFacturatie"
        :facturaties="facturatiesStore.facturaties.filter((fac: Facturatie) => !fac.organisatie && fac.created_by === authStore.currentlyLoggedIn?.id)"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .facturatie-form-wrapper {
    position: absolute;
    background-color: rgb(245, 245, 245);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 4rem;
    max-height: 700px;
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

  .close-sub-form {
    cursor: pointer;
  }

  .form {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
  }

  ul {
    flex: 3;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .p-dropdown {
        flex: 1;
      }
    }
  }

  :deep(.p-dropdown) {
    width: 100%;
  }

  :deep(.p-float-label) {
    display: flex;
    flex: 1;
  }
</style>
