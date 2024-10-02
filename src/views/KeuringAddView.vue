<script lang="ts" setup>
  import SelectedFacturatie from '@/components/SelectedFacturatie.vue'
  import WEVAddressForm from '@/components/WEVAddressForm.vue'
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import WEVClientForm from '@/components/WEVClientForm.vue'
  import WEVExtraDocsForm from '@/components/WEVExtraDocsForm.vue'
  import WEVFacturatieForm from '@/components/WEVFacturatieForm.vue'
  import WEVCancelCreationKeuring from '@/components/modals/WEVCancelModal.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import type { Rol } from '@/enums/modules/Rol'
  import { Status } from '@/enums/modules/Status'
  import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
  import { TypeKeuring } from '@/enums/modules/TypeKeuring'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useDeskundigenStore } from '@/stores/deskundigenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Adres, FormKeuring, Gebruiker } from '@/types'
  import { Icon } from '@iconify/vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import 'add-to-calendar-button'
  import axios from 'axios'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea'
  import { useToast } from 'primevue/usetoast'
  import { computed, onBeforeMount, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  const authStore = useAuthStore()
  const keuringenStore = useKeuringenStore()
  const klantenStore = useKlantenStore()
  const adressenStore = useAdressenStore()
  const extraDocumentenStore = useExtraDocumentStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const deskundigenStore = useDeskundigenStore()
  const router = useRouter()
  const toast = useToast()

  const keuringForm: FormKeuring = reactive({
    type: [],

    adresID: '',
    klantID: '',
    facturatieID: null,
    facturatie_bestemming: (authStore.currentlyLoggedIn?.rol as string).includes('immo') ? FacturatieBestemming.IMMO : FacturatieBestemming.HETZELFDE,

    status: Status.NIEUW,
    opmerking: '',
    toegang_eenheid: ToegangEenheid.KLANT,
    datum_plaatsbezoek: null,
    epc_certificaten: [],
    asbest_certificaten: [],
    extra_documenten: [],
    created_by: {
      id: authStore.currentlyLoggedIn?.id as string,
      gebruikersnaam: authStore.currentlyLoggedIn?.gebruikersnaam as string,
      voornaam: authStore.currentlyLoggedIn?.voornaam as string,
      achternaam: authStore.currentlyLoggedIn?.achternaam as string,
      email: authStore.currentlyLoggedIn?.email as string,
      telefoonnummer: authStore.currentlyLoggedIn?.telefoonnummer as string,
      rol: authStore.currentlyLoggedIn?.rol as Rol,
      specialisatie: authStore.currentlyLoggedIn?.specialisatie as TypeKeuring,
      organisatie: {
        id: authStore.currentlyLoggedIn?.organisatie.id as string,
        naam: authStore.currentlyLoggedIn?.organisatie.naam as string
      },
      avatar: authStore.currentlyLoggedIn?.avatar as string
    },
    admin_event_ID: null,
    event_ID: null,
    asbest_event_ID: null,
    epc_toegewezen_aan: null,
    asbest_toegewezen_aan: null
  })

  const isCancelModalOpen = ref<boolean>(false)
  const datum_plaatsbezoek_edited = ref<boolean>(false)
  const editClientEmailPhoneNumber = ref<boolean>(false)

  const isAddressSubFormVisible = ref<boolean>(false)
  const isClientSubFormVisible = ref<boolean>(false)
  const isFacturatieSubFormVisible = ref<boolean>(false)
  const isExtraDocsUploaderVisible = ref<boolean>(false)

  const showAddressSubForm = () => {
    isClientSubFormVisible.value = false
    isAddressSubFormVisible.value = true
  }

  const hideAddressSubForm = () => {
    isAddressSubFormVisible.value = false
  }

  const showClientSubForm = () => {
    isAddressSubFormVisible.value = false
    isClientSubFormVisible.value = true
  }

  const hideClientSubForm = () => {
    isClientSubFormVisible.value = false
  }

  const showFacturatieSubForm = () => {
    isFacturatieSubFormVisible.value = true
  }

  const hideFacturatieSubForm = () => {
    isFacturatieSubFormVisible.value = false
  }

  onBeforeMount(() => {
    extraDocumentenStore.empty()
  })

  watch(
    () => keuringForm.type,
    (newType) => {
      if (newType.includes(TypeKeuring.EPC)) {
        const epcDeskundige = deskundigenStore.deskundigen.find((d: Gebruiker) => d.email === process.env.DEFAULT_EPC)!

        if (epcDeskundige.id) {
          keuringForm.epc_toegewezen_aan = epcDeskundige.id
        }
      } else {
        keuringForm.epc_toegewezen_aan = null
      }

      if (newType.includes(TypeKeuring.ASBEST)) {
        const asbestDeskundige = deskundigenStore.deskundigen.find((d: Gebruiker) => d.email === process.env.DEFAULT_ASBEST)!

        if (asbestDeskundige.id) {
          keuringForm.asbest_toegewezen_aan = asbestDeskundige.id
        }
      } else {
        keuringForm.asbest_toegewezen_aan = null
      }
    }
  )

  const keuringAddress = computed(() => {
    return adressenStore.adressen.find((adres: Adres) => adres.id === keuringForm.adresID)
  })

  const keuringClient = computed(() => {
    return klantenStore.klanten.find((klant) => klant.id === keuringForm.klantID)
  })

  const vlaamseStad = computed(() => {
    if (keuringAddress.value) {
      return vlaamseStedenStore.getStadById(keuringAddress.value.vlaamse_stad_ID)
    }
    return ''
  })

  const dropdownEPCValue = computed(() => {
    const value = deskundigenStore.deskundigen.filter((d: Gebruiker) => d.id === keuringForm.epc_toegewezen_aan)[0]
    return `${value.voornaam} ${value.achternaam}`
  })

  const dropdownAsbestValue = computed(() => {
    const value = deskundigenStore.deskundigen.filter((d: Gebruiker) => d.id === keuringForm.asbest_toegewezen_aan)[0]
    return `${value.voornaam} ${value.achternaam}`
  })

  const uploadExtraDocumenten = async (event: Event) => {
    const { files } = event.target as HTMLInputElement
    if (files) {
      const fileListArray = Array.from(files || [])

      for (const file of fileListArray) {
        const { error } = await supabase.storage.from('extra-documenten').upload(file.name, file)
        if (error) {
          console.error('Could not upload extra document')
        } else {
          extraDocumentenStore.addExtraDocument({
            naam: file.name,
            size: file.size,
            type: file.type,
            adresID: keuringForm.adresID
          })

          const { error: errorUploadedExtraDocument } = await supabase.from('extra_documenten').insert([
            {
              naam: file.name,
              size: file.size,
              type: file.type,
              adres_ID: keuringForm.adresID
            }
          ])

          if (errorUploadedExtraDocument) console.error('Could not insert extra document into DB')
        }
      }
    }
  }

  const removeDocument = async (event: Event, name: string) => {
    event.preventDefault()

    const { error } = await supabase.storage.from('extra-documenten').remove([`${name}`])
    if (error) {
      console.error(`Unable to remove ${name} from the storage`)
    } else {
      extraDocumentenStore.removeExtraDocument(name)
    }
  }

  const uploadKeuring = async () => {
    const { data: uploadedKeuring } = await supabase
      .from('keuringen')
      .insert([
        {
          created_by: keuringForm.created_by?.id,
          organisatie_ID: keuringForm.created_by?.organisatie.id,
          adres_ID: keuringForm.adresID,
          klant_ID: keuringForm.klantID,
          facturatie_ID: keuringForm.facturatieID,
          facturatie_bestemming: keuringForm.facturatie_bestemming,
          status: keuringForm.status,
          type:
            keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)
              ? TypeKeuring.EPC_ASBEST
              : keuringForm.type.includes(TypeKeuring.EPC)
                ? TypeKeuring.EPC
                : TypeKeuring.ASBEST,
          opmerking: keuringForm.opmerking,
          toegang_eenheid: keuringForm.toegang_eenheid,
          datum_plaatsbezoek: keuringForm.datum_plaatsbezoek,
          admin_event_ID: keuringForm.admin_event_ID,
          event_ID: keuringForm.event_ID,
          asbest_event_ID: keuringForm.asbest_event_ID,
          epc_toegewezen_aan: keuringForm.epc_toegewezen_aan,
          asbest_toegewezen_aan: keuringForm.asbest_toegewezen_aan
        }
      ])
      .select('*, created_by: gebruikers!keuringen_created_by_fkey(*, organisatie: organisaties(*))')
      .single()

    if (extraDocumentenStore.extra_documenten) {
      const { error: errorUploadedExtraDocument } = await supabase.from('extra_documenten').insert(
        extraDocumentenStore.extra_documenten.map((extraDoc) => ({
          naam: extraDoc.naam,
          size: extraDoc.size,
          type: extraDoc.type,
          adres_ID: keuringForm.adresID
        }))
      )

      if (errorUploadedExtraDocument) {
        console.error('Could not store Extra Document')
      }
    }

    if (uploadedKeuring) {
      toast.add({ severity: 'success', summary: 'Keuring succesvol aangemaakt!', group: 'br', life: 5000 })

      keuringenStore.addKeuring({
        id: uploadedKeuring.id,
        klantID: uploadedKeuring.klant_ID,
        adresID: uploadedKeuring.adres_ID,
        status: uploadedKeuring.status,
        type: uploadedKeuring.type,
        toegang_eenheid: uploadedKeuring.toegang_eenheid,
        datum_toewijzing: new Date(uploadedKeuring.created_at),
        datum_plaatsbezoek: uploadedKeuring.datum_plaatsbezoek ? new Date(uploadedKeuring.datum_plaatsbezoek) : null,
        created_by: uploadedKeuring.created_by,
        organisatie_ID: uploadedKeuring.organisatie_ID,
        opmerking: uploadedKeuring.opmerking,
        facturatieID: uploadedKeuring.facturatie_ID,
        admin_event_ID: uploadedKeuring.admin_event_ID,
        event_ID: uploadedKeuring.event_ID,
        asbest_event_ID: uploadedKeuring.asbest_event_ID,
        epc_toegewezen_aan: uploadedKeuring.epc_toegewezen_aan,
        asbest_toegewezen_aan: uploadedKeuring.asbest_toegewezen_aan
      })

      extraDocumentenStore.empty()

      if (uploadedKeuring.epc_toegewezen_aan) {
        const epcDeskundigen = deskundigenStore.deskundigen.filter((deskundige) => uploadedKeuring.epc_toegewezen_aan === deskundige.id && deskundige.email !== process.env.ADMIN_MAIL)!
        epcDeskundigen.map(async (deskundige) => {
          await sendMail(
            deskundige.email,
            `Nieuwe keuring aangemaakt door: ${authStore.currentlyLoggedIn?.organisatie.naam}`,
            uploadedKeuring.type,
            `${process.env.FRONTEND_BASE_URL}/keuringen/${uploadedKeuring.id}`
          )
        })
      }

      if (uploadedKeuring.asbest_toegewezen_aan && uploadedKeuring.asbest_toegewezen_aan !== uploadedKeuring.epc_toegewezen_aan) {
        const asbestDeskundigen = deskundigenStore.deskundigen.filter((deskundige) => uploadedKeuring.asbest_toegewezen_aan === deskundige.id && deskundige.email !== process.env.ADMIN_MAIL)!
        asbestDeskundigen.map(async (deskundige) => {
          await sendMail(
            deskundige.email,
            `Nieuwe keuring aangemaakt door: ${authStore.currentlyLoggedIn?.organisatie.naam}`,
            uploadedKeuring.type,
            `${process.env.FRONTEND_BASE_URL}/keuringen/${uploadedKeuring.id}`
          )
        })
      }

      await sendMail(
        `${process.env.ADMIN_MAIL}`,
        `Nieuwe keuring aangemaakt door: ${authStore.currentlyLoggedIn?.organisatie.naam}`,
        uploadedKeuring.type,
        `${process.env.FRONTEND_BASE_URL}/keuringen/${uploadedKeuring.id}`
      )

      router.push('/keuringen')
    }
  }

  const sendMail = async (to: string, subject: string, type: string, link: string) => {
    await axios.post(`${process.env.BACKEND_BASE_URL}/send-mail`, { to, subject, type, link })
  }

  const handleDate = () => {
    datum_plaatsbezoek_edited.value = true
    keuringForm.status = Status.INGEPLAND
  }

  const handleDateClear = () => {
    keuringForm.status = Status.NIEUW
  }

  const addEventToCalendar = async (keuring: FormKeuring) => {
    if (keuringClient.value) {
      if (keuring.datum_plaatsbezoek && keuringAddress.value && vlaamseStad.value) {
        const endTime = new Date(keuring.datum_plaatsbezoek)
        endTime.setMinutes(keuring.datum_plaatsbezoek.getMinutes() + 45)

        const event = {
          summary: `${keuringForm.type.join(' + ')} - ${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}${keuringAddress.value.busnummer ? ' ' + keuringAddress.value.busnummer : ''}, ${
            vlaamseStad.value.postcode
          } ${vlaamseStad.value.gemeente}`,
          location: `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}${keuringAddress.value.busnummer ? ' ' + keuringAddress.value.busnummer : ''}, ${vlaamseStad.value.postcode} ${
            vlaamseStad.value.gemeente
          }`,
          description: `${keuringForm.type.join(' + ')} keuring\n${keuringClient.value.voornaam} ${keuringClient.value.achternaam}\n${keuringClient.value.emailadres}\n${String(
            keuringClient.value.telefoonnummer
          ).replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`,
          start: keuring.datum_plaatsbezoek,
          end: endTime
        }
        const eventReceivingDeskundigen = deskundigenStore.deskundigen.filter(
          (deskundige) => deskundige.gebruikersnaam === process.env.WEV_ADMIN || deskundige.id === keuringForm.epc_toegewezen_aan || deskundige.id === keuringForm.asbest_toegewezen_aan
        )
        for (const deskundige of eventReceivingDeskundigen) {
          try {
            const response = await axios.post(`${process.env.BACKEND_BASE_URL}/calendars/${deskundige.gebruikersnaam}/events`, {
              eventSummary: event.summary,
              eventLocation: event.location,
              eventDescription: event.description,
              eventStart: event.start,
              eventEnd: event.end
            })
            if (deskundige.gebruikersnaam === process.env.WEV_ADMIN && deskundige.id !== keuringForm.epc_toegewezen_aan) {
              keuringForm.admin_event_ID = response.data
            }
            if (deskundige.id === keuringForm.epc_toegewezen_aan) {
              keuringForm.event_ID = response.data
            }
            if (deskundige.id === keuringForm.asbest_toegewezen_aan) {
              keuringForm.asbest_event_ID = response.data
            }
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
  }

  const submitForm = async (event: Event) => {
    event.preventDefault()

    if (keuringForm.type.length === 0 || !keuringForm.adresID || !keuringForm.klantID) return

    if (datum_plaatsbezoek_edited.value) {
      await addEventToCalendar(keuringForm)
    }

    uploadKeuring()
  }

  const handleChangeFacturatieBestemming = (event: any) => {
    event.preventDefault()

    if (keuringForm.facturatie_bestemming !== FacturatieBestemming.ANDERS) {
      keuringForm.facturatieID = null
      hideFacturatieSubForm()
    } else {
      keuringForm.facturatieID = ''
      showFacturatieSubForm()
    }
  }

  const selectAddress = (id: string) => {
    keuringForm.adresID = id
    isAddressSubFormVisible.value = false
  }

  const selectClient = (id: string) => {
    keuringForm.klantID = id
    isClientSubFormVisible.value = false
  }

  const selectFacturatie = (id: string) => {
    keuringForm.facturatieID = id
    isFacturatieSubFormVisible.value = false
  }

  const handleClick = () => {
    extraDocumentenStore.empty()
    router.push('/keuringen')
  }

  const handleConfirm = () => {
    toast.add({ severity: 'error', detail: 'Keuring geannuleerd!', group: 'br', life: 500000 })
    router.push('/keuringen')
  }

  const handleClientCloseClick = () => {
    keuringForm.klantID = ''
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
  }

  const handleAddressCloseClick = () => {
    keuringForm.adresID = ''
  }

  const showExtraDocumentenSubForm = () => {
    isExtraDocsUploaderVisible.value = true
  }

  const handleConfirmEdit = async () => {
    if (keuringClient.value && keuringClient.value.id) {
      const { error } = await supabase
        .from('klanten')
        .update({
          emailadres: keuringClient.value.emailadres,
          telefoonnummer: keuringClient.value.telefoonnummer
        })
        .eq('id', keuringClient.value.id)

      if (error) {
        console.error('Error updating klant: ', error)
        return
      }
      editClientEmailPhoneNumber.value = false
    }
  }

  const handleDeselectionFacturatie = () => {
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
    hideFacturatieSubForm()
  }

  const handleCloseFacturatieSubForm = () => {
    handleDeselectionFacturatie()
  }
</script>

<template>
  <div class="container add-keuring">
    <div class="title">
      <WEVBackButton @click="handleClick" />
      <h1 class="text-2xl">Keuring toevoegen</h1>
    </div>
    <form @submit="submitForm">
      <div class="content">
        <div class="column">
          <div class="type text-sm">
            <span class="cb-epc">
              <input type="checkbox" name="typekeuring" id="tk_epc" :value="TypeKeuring.EPC" v-model="keuringForm.type" />
              <label for="tk_epc">{{ TypeKeuring.EPC }}</label>
              <Dropdown
                v-if="keuringForm.epc_toegewezen_aan && authStore.currentlyLoggedIn?.organisatie.naam === 'WoonExpertVlaanderen'"
                v-model="keuringForm.epc_toegewezen_aan"
                :options="deskundigenStore.deskundigen.filter((d: Gebruiker) => d.specialisatie.includes(TypeKeuring.EPC))"
                optionValue="id"
              >
                <template #value="">
                  <div>
                    {{ dropdownEPCValue }}
                  </div>
                </template>
                <template #option="slotProps">
                  <div>
                    {{ `${slotProps.option.voornaam} ${slotProps.option.achternaam}` }}
                  </div>
                </template>
              </Dropdown>
            </span>
            <span class="cb-asbest">
              <input type="checkbox" name="typekeuring" id="tk_asbest" :value="TypeKeuring.ASBEST" v-model="keuringForm.type" />
              <label for="tk_asbest" class="ml-2">{{ TypeKeuring.ASBEST }}</label>
              <Dropdown
                v-if="keuringForm.asbest_toegewezen_aan && authStore.currentlyLoggedIn?.organisatie.naam === 'WoonExpertVlaanderen'"
                v-model="keuringForm.asbest_toegewezen_aan"
                :options="deskundigenStore.deskundigen.filter((d: Gebruiker) => d.specialisatie.includes(TypeKeuring.ASBEST))"
                optionValue="id"
              >
                <template #value="">
                  <div>
                    {{ dropdownAsbestValue }}
                  </div>
                </template>
                <template #option="slotProps">
                  <div>
                    {{ `${slotProps.option.voornaam} ${slotProps.option.achternaam}` }}
                  </div>
                </template>
              </Dropdown>
            </span>
          </div>
          <div class="adres-wrapper text-base">
            <div v-if="keuringAddress && vlaamseStad" class="data-row">
              <div class="adres">
                {{ `${keuringAddress.straatnaam} ${keuringAddress.nummer}${keuringAddress.busnummer ? ' ' + keuringAddress.busnummer : ''}, ${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
              </div>
              <div class="edit-close">
                <div @click="handleAddressCloseClick">
                  <Icon icon="mdi:close" width="20" />
                </div>
              </div>
            </div>
            <div v-else class="red">
              <div class="adres">
                <span>Geen adres geselecteerd</span>
                <Icon icon="mdi:plus" width="20" @click="showAddressSubForm" />
              </div>
            </div>
          </div>
          <div class="klant-wrapper text-base">
            <div v-if="keuringClient" class="data-row">
              <div class="klant">
                <div class="name">
                  {{ `${keuringClient.voornaam} ${keuringClient.achternaam}` }}
                </div>
                <div class="email-tel" v-if="editClientEmailPhoneNumber">
                  <div>
                    <Icon icon="mdi:envelope-outline" width="20" />
                    <InputText class="text-sm" type="text" v-model="keuringClient.emailadres" />
                  </div>
                  <div>
                    <Icon icon="mdi:phone-outline" width="20" />
                    <InputText class="text-sm" type="text" v-model="keuringClient.telefoonnummer" />
                  </div>
                </div>
                <div class="email-tel text-sm" v-else>
                  <div>
                    <Icon icon="mdi:envelope-outline" width="20" />
                    <span>
                      {{ keuringClient.emailadres }}
                    </span>
                  </div>
                  <div>
                    <Icon icon="mdi:phone-outline" width="20" />
                    <span>
                      {{ keuringClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="edit-close">
                <div @click="handleConfirmEdit" v-if="editClientEmailPhoneNumber">
                  <Icon icon="mdi:check" width="20" />
                </div>
                <div @click="editClientEmailPhoneNumber = true" v-else>
                  <Icon icon="mdi:pencil" width="20" />
                </div>
                <div @click="handleClientCloseClick">
                  <Icon icon="mdi:close" width="20" />
                </div>
              </div>
            </div>
            <div v-else class="red">
              <div class="arrow" v-if="isClientSubFormVisible"></div>
              <div class="klant">
                <span>Geen klant geselecteerd</span>
                <Icon icon="mdi:plus" width="20" @click="showClientSubForm" />
              </div>
            </div>
          </div>
          <div class="toegang-eenheid text-base">
            <h3 class="text-base">Toegang tot eenheid</h3>
            <div class="text-sm">
              <span class="rb-klant">
                <input type="radio" name="toegangEenheid" id="te_klant" v-model="keuringForm.toegang_eenheid" :value="ToegangEenheid.KLANT" />
                <label for="te_klant">Afspreken met klant</label>
              </span>
              <span class="rb-sleutels">
                <input type="radio" name="toegangEenheid" id="te_immo" v-model="keuringForm.toegang_eenheid" :value="ToegangEenheid.SLEUTELS" />
                <label for="te_immo">Sleutels ophalen</label>
              </span>
              <span class="rb-sleutels">
                <input type="radio" name="toegangEenheid" id="te_huurder" v-model="keuringForm.toegang_eenheid" :value="ToegangEenheid.HUURDER" />
                <label for="te_huurder">Huurder</label>
              </span>
            </div>
          </div>
          <div class="datum-plaatsbezoek-wrapper" v-if="keuringForm.type.length && keuringAddress && keuringClient && authStore.currentlyLoggedIn?.rol === 'deskundige'">
            <h3 class="text-base">Datum Plaatsbezoek</h3>
            <VueDatePicker
              uid="wev-add-keuring-datepicker"
              v-model="keuringForm.datum_plaatsbezoek"
              :min-date="new Date()"
              @update:model-value="handleDate"
              @cleared="handleDateClear"
              preview-format="dd/MM/yyyy HH:mm"
              format="dd/MM/yyyy HH:mm"
              :min-time="{ hours: 7, minutes: 0 }"
              :max-time="{ hours: 19, minutes: 0 }"
              locale="nl"
              cancel-text="Sluiten"
              select-text="Selecteer"
            />
          </div>
        </div>
        <div class="column">
          <div class="facturatie-wrapper">
            <h3 class="text-base">Facturatie</h3>
            <div style="display: flex; flex-direction: column; gap: 1.5rem">
              <div class="data-row">
                <div class="rbs-bestemming text-sm">
                  <span class="rb-hetzelfde">
                    <input
                      v-model="keuringForm.facturatie_bestemming"
                      type="radio"
                      name="facturatieBestemming"
                      id="fac_hetzelfde"
                      @change="handleChangeFacturatieBestemming"
                      :value="FacturatieBestemming.HETZELFDE"
                    />
                    <label for="fac_hetzelfde">Klant</label>
                  </span>
                  <span class="rb-immo">
                    <input
                      v-model="keuringForm.facturatie_bestemming"
                      type="radio"
                      name="facturatieBestemming"
                      id="fac_immo"
                      @change="handleChangeFacturatieBestemming"
                      :value="FacturatieBestemming.IMMO"
                    />
                    <label for="fac_immo" v-if="authStore.currentlyLoggedIn?.rol.includes('immo')">{{ authStore?.currentlyLoggedIn.organisatie.naam }}</label>
                    <label for="fac_immo" v-else>Immo</label>
                  </span>
                  <span class="rb-anders" v-if="keuringClient">
                    <input
                      v-model="keuringForm.facturatie_bestemming"
                      type="radio"
                      name="facturatieBestemming"
                      id="fac_anders"
                      @change="handleChangeFacturatieBestemming"
                      :value="FacturatieBestemming.ANDERS"
                    />
                    <label for="fac_anders">Anders</label>
                  </span>
                </div>
                <div class="edit-close">
                  <div v-if="keuringForm.facturatie_bestemming !== FacturatieBestemming.HETZELFDE" @click="handleDeselectionFacturatie">
                    <Icon icon="mdi:close" width="20" />
                  </div>
                </div>
              </div>
              <SelectedFacturatie :form="keuringForm" />
            </div>
          </div>
          <div class="opmerking">
            <Textarea class="text-sm" id="ta-opmerking" v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
          </div>
          <div class="uploader-wrapper">
            <Button raised @click="showExtraDocumentenSubForm" :disabled="!(keuringForm.adresID && keuringForm.klantID && keuringForm.type.length !== 0)">
              <span class="text text-xs">
                <Icon icon="mdi:file-document" width="20" />
                Extra documenten
              </span>
              <span class="amount text-xs">{{ extraDocumentenStore.extra_documenten.length }}</span>
            </Button>
          </div>
        </div>
      </div>
      <div class="actions">
        <Button type="button" raised severity="danger" @click="isCancelModalOpen = true" class="text-xs">Annuleer</Button>
        <Button type="submit" raised severity="success" class="text-xs">Voeg keuring toe</Button>
        <WEVCancelCreationKeuring :isOpen="isCancelModalOpen" @closeWindow="isCancelModalOpen = false" @confirm="handleConfirm" />
      </div>
    </form>
    <div class="sub-form" v-if="isAddressSubFormVisible || isClientSubFormVisible">
      <WEVAddressForm v-if="isAddressSubFormVisible" @select-address="selectAddress" @close-sub-form="hideAddressSubForm" />
      <WEVClientForm v-if="isClientSubFormVisible" @select-client="selectClient" @close-sub-form="hideClientSubForm" />
    </div>
    <div class="sub-form" v-if="isFacturatieSubFormVisible || isExtraDocsUploaderVisible">
      <WEVFacturatieForm
        v-if="isFacturatieSubFormVisible"
        @select-facturatie="selectFacturatie"
        @close-sub-form="handleCloseFacturatieSubForm"
        :keuringClient="keuringClient"
        :keuringAddress="keuringAddress"
        :form="keuringForm"
        :klanten="klantenStore.klanten"
        :adressen="adressenStore.adressen"
      />
      <WEVExtraDocsForm
        v-if="isExtraDocsUploaderVisible"
        :form="keuringForm"
        @hideSubForm="isExtraDocsUploaderVisible = !isExtraDocsUploaderVisible"
        @uploadExtraDocumenten="(event: Event) => uploadExtraDocumenten(event)"
        @removeDocument="(event: Event, name: string) => removeDocument(event, name)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .add-keuring {
    display: flex;
    flex-direction: column;
    font-family: 'Rubik', sans-serif;
    max-width: 1350px;
    margin: auto;
  }

  .title {
    display: flex;
    align-items: center;
    width: 100%;
    margin: auto;
    padding-block: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;

    .content {
      display: flex;
      gap: 3rem;
    }
  }

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .sub-form {
    z-index: 20;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .actions {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 0.5rem;
    flex: 1;

    button {
      font-weight: bold;
    }
  }

  .edit-close {
    display: flex;
    flex-direction: row;
    gap: 1rem;

    div {
      display: flex;
      border-radius: 50%;
      cursor: pointer;

      &:hover {
        color: seagreen;
      }
    }
  }

  .data-row {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    .klant {
      flex-direction: column;
    }

    .email-tel {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      margin-top: 0.2rem;
      padding-top: 0.25rem;
      color: #4b5563;

      span {
        display: flex;
        align-items: center;
      }
    }
  }

  .type {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .cb-epc,
    .cb-asbest {
      display: flex;
      align-items: center;
      height: 40px;

      label {
        width: 80px;
        margin-left: 1rem;
      }
    }
  }

  .toegewezen-aan {
    display: flex;
    flex-direction: column;
    width: 50%;
  }

  .toegang-eenheid {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    div {
      display: flex;
      gap: 2rem;
    }

    .rb-klant,
    .rb-sleutels {
      display: flex;
      align-items: center;
      accent-color: seagreen;

      label {
        margin-left: 1em;
      }

      input {
        margin-left: 0.5rem;
      }
    }
  }

  .red .adres,
  .red .klant {
    align-items: center;
    border-left: 2px solid crimson;
  }

  .adres,
  .klant {
    display: flex;
    border-left: 2px solid seagreen;

    svg {
      margin-left: 1rem;
      cursor: pointer;
    }
  }

  .email-tel {
    div {
      display: flex;
      gap: 0.5rem;
      width: 300px;
      height: 24px;
      border: 1px solid transparent;
    }

    input {
      flex: 1;
      height: 24px;
      padding: 0.5rem;
      font-family: 'Rubik', sans-serif;
    }

    span {
      padding-inline: 0.5rem;
    }
  }

  .toegewezen-aan,
  .adres,
  .klant,
  .name,
  .fac_name,
  .fac_adres {
    font-weight: 600;
  }

  .toegewezen-aan-wrapper,
  .toegang-eenheid,
  .opmerking,
  .adres,
  .adres-error,
  .klant,
  .klant-error,
  .facturatie-wrapper,
  .datum-plaatsbezoek-wrapper {
    display: flex;
    padding-left: 1.5rem;
  }

  .toegewezen-aan-wrapper,
  .toegang-eenheid,
  .opmerking,
  .facturatie-wrapper,
  .datum-plaatsbezoek-wrapper {
    border-left: 2px solid seagreen;
  }

  .facturatie-wrapper {
    flex-direction: column;
    gap: 1rem;

    .rbs-bestemming {
      height: 30px;
      display: flex;
      align-items: center;
      gap: 2rem;

      .rb-hetzelfde,
      .rb-immo,
      .rb-anders {
        display: flex;
        accent-color: seagreen;

        label {
          display: flex;
          align-items: center;
          margin-left: 1em;
        }
      }
    }
  }

  .fac_adres {
    margin-top: 0.5em;
  }

  .opmerking {
    display: flex;
    flex-direction: column;
    gap: 1.5em;

    textarea {
      display: block;
      font-family: 'Rubik', sans-serif;
      padding: 1em;
      resize: none;
      width: 100%;
    }
  }

  .uploader-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    button {
      flex: 1;
      display: flex;
      gap: 1rem;
      font-weight: bold;
      background-color: seagreen;
      border-color: seagreen;

      .text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
      }
    }
  }

  .datum-plaatsbezoek-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 50%;
  }

  :deep(.p-dropdown-label) {
    line-height: 1rem; //16px
    font-size: 0.875rem; //14px
    padding-block: 0.5rem;
    width: 200px;
  }

  @media screen and (max-width: 1550px) {
    form {
      padding-top: 0;
    }
  }
</style>
