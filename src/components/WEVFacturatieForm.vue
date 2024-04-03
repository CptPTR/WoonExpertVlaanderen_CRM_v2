<script setup lang="ts">
  import FacturatieList from '@/components/FacturatieList.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Facturatie, FormKeuring, VlaamseStad } from '@/types'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'

  const props = defineProps(['form', 'klanten', 'adressen', 'keuringClient', 'keuringAddress'])
  const emits = defineEmits(['selectFacturatie'])

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
          fac.vlaamse_stad_ID === keuringFacturatie.value.vlaamse_stad_ID
      ).length !== 0
    )
  })

  const selectFacturatie = (id: string) => {
    form.value.facturatieID = id
  }

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
          organisatieID: null,
          vlaamse_stad_ID: keuringFacturatie.value.vlaamse_stad_ID
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
          organisatie: null,
          // vlaamse_stad: {
          //   id: fac.vlaamse_stad.id,
          //   gemeente: fac.vlaamse_stad.gemeente,
          //   stad: fac.vlaamse_stad.stad,
          //   provincie: fac.vlaamse_stad.provincie,
          //   postcode: fac.vlaamse_stad.postcode
          // },
          vlaamse_stad_ID: fac.vlaamse_stad_ID
        })
      })
    }
  }
</script>

<template>
  <section class="klant">
    <h2>Facturatie</h2>
    <div class="facturatie">
      <div class="content">
        <div class="form-bestemming">
          <ul>
            <li>
              <InputText type="text" v-model="keuringFacturatie.voornaam" id="fac_voornaam" placeholder="Voornaam" required />
              <InputText type="text" v-model="keuringFacturatie.achternaam" id="fac_familienaam" placeholder="Familienaam" required />
            </li>
            <li>
              <InputText type="email" v-model="keuringFacturatie.emailadres" id="fac_emailadres" placeholder="Emailadres" required />
            </li>
            <li>
              <InputText type="tel" v-model="keuringFacturatie.telefoonnummer" id="fac_telefoonnummer" pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}" placeholder="Telefoonnummer" required />
            </li>
            <li>
              <InputText type="text" v-model="keuringFacturatie.straatnaam" id="fac_straatnaam" placeholder="Straat" required />
              <InputText type="text" v-model="keuringFacturatie.nummer" id="fac_nummer" placeholder="Nr" maxlength="10" required />
            </li>
            <li v-if="keuringFacturatie.vlaamse_stad_ID">
              <Dropdown
                resetFilterOnHide
                filter
                v-model="keuringFacturatie.vlaamse_stad_ID"
                optionLabel="gemeente"
                optionValue="id"
                placeholder="Gemeente"
                :options="vlaamseStedenStore.vlaamse_steden.map((vlaamse_stad: VlaamseStad) => vlaamse_stad)"
              />
            </li>
          </ul>
          <div class="acties" v-if="form.facturatie_bestemming === FacturatieBestemming.ANDERS">
            <input
              type="button"
              value="Toevoegen"
              class="confirm"
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
            />
          </div>
        </div>
        <!-- @selectFacturatie="selectFacturatie" -->
        <FacturatieList
          @select-facturatie="(id: string) => selectFacturatie(id)"
          :selectedFacturatie="form.facturatieID"
          :keuringFacturatie="keuringFacturatie"
          :facturaties="facturatiesStore.facturaties.filter((fac: Facturatie) => !fac.organisatie)"
        />
      </div>
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
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 15px;

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

    input[id='fac_nummer'] {
      flex: 0;
      width: 100px;
    }
  }

  .facturatie {
    display: flex;
    gap: 20px;
    padding-top: 2.25rem;

    .content {
      display: flex;
      gap: 4.5rem;
      flex: 1;
    }

    .form-bestemming {
      display: flex;
      flex-direction: column;

      gap: 2.5rem;
    }

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 15px;

      li {
        display: flex;
        align-items: center;

        input {
          padding: 0.75rem;

          border: solid 1px rgb(226, 232, 240);
        }
      }
    }

    input[id='fac_nummer'] {
      width: 100px;
    }
  }

  // .gevonden-adressen {
  //     margin-top: 2rem;

  //     .gevonden-adres {
  //         width: fit-content;
  //         padding: 0.5rem 1rem;
  //         border: 1px solid #000;
  //         border-radius: 2rem;
  //         cursor: pointer;
  //     }
  // }
</style>
