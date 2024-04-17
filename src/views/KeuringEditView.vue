<script setup lang="ts">
  import WEVAddressForm from '@/components/WEVAddressForm.vue'
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import WEVCertificatesForm from '@/components/WEVCertificatesForm.vue'
  import WEVClientForm from '@/components/WEVClientForm.vue'
  import WEVExtraDocsForm from '@/components/WEVExtraDocsForm.vue'
  import WEVFacturatieForm from '@/components/WEVFacturatieForm.vue'
  import WEVCancelModal from '@/components/modals/WEVCancelModal.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import type { Rol } from '@/enums/modules/Rol'
  import { Status } from '@/enums/modules/Status'
  import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
  import { TypeKeuring } from '@/enums/modules/TypeKeuring'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { useDeskundigenStore } from '@/stores/deskundigenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Certificaat, FormKeuring, Gebruiker } from '@/types'
  import { Icon } from '@iconify/vue'
  import 'add-to-calendar-button'
  import axios from 'axios'
  import { gsap } from 'gsap'
  import Button from 'primevue/button'
  import Checkbox from 'primevue/checkbox'
  import Dropdown from 'primevue/dropdown'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import InputText from 'primevue/inputtext'
  import RadioButton from 'primevue/radiobutton'
  import Textarea from 'primevue/textarea'
  import { useToast } from 'primevue/usetoast'
  import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const authStore = useAuthStore()
  const deskundigenStore = useDeskundigenStore()
  const keuringenStore = useKeuringenStore()
  const adressenStore = useAdressenStore()
  const klantenStore = useKlantenStore()
  const facturatiesStore = useFacturatiesStore()
  const certificatenStore = useCertificaatStore()
  const extraDocumentenStore = useExtraDocumentStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const loadingKeuring = ref<boolean>(true)
  const editClientEmailPhoneNumber = ref<boolean>(false)
  const datum_plaatsbezoek_edited = ref<boolean>(false)
  const keuringForm: FormKeuring = reactive({
    type: [],

    klantID: '',
    voornaam: '',
    familienaam: '',
    emailadres: '',
    telefoonnummer: '',

    adresID: '',
    straatnaam: '',
    nummer: '',
    vlaamse_stad_ID: '',

    facturatieID: '',
    facturatie_bestemming: FacturatieBestemming.HETZELFDE,

    status: Status.NIEUW,
    opmerking: '',
    toegang_eenheid: ToegangEenheid.KLANT,
    datum_plaatsbezoek: new Date(),
    epc_certificaten: [],
    asbest_certificaten: [],
    extra_documenten: [],
    created_by: {
      id: authStore.currentlyLoggedIn?.id as string,
      voornaam: authStore.currentlyLoggedIn?.voornaam as string,
      achternaam: authStore.currentlyLoggedIn?.achternaam as string,
      email: authStore.currentlyLoggedIn?.email as string,
      telefoonnummer: authStore.currentlyLoggedIn?.telefoonnummer as string,
      rol: authStore.currentlyLoggedIn?.rol as Rol,
      specialisatie: authStore.currentlyLoggedIn?.specialisatie as TypeKeuring,
      organisatie: {
        naam: authStore.currentlyLoggedIn?.organisatie.naam as string
      },
      avatar: authStore.currentlyLoggedIn?.avatar as string
    },
    facturatie: {
      bestemming: FacturatieBestemming.HETZELFDE,
      voornaam: '',
      achternaam: '',
      emailadres: '',
      telefoonnummer: '',
      straatnaam: '',
      nummer: '',
      vlaamse_stad: {
        gemeente: '',
        stad: '',
        provincie: '',
        postcode: ''
      }
    },
    event_ID: null,
    asbest_event_ID: null,
    epc_toegewezen_aan: null,
    asbest_toegewezen_aan: null
  })

  const certificatesFormVisible = ref<boolean>(false)
  const extraDocsFormVisible = ref<boolean>(false)
  const isCancelModalOpen = ref<boolean>(false)

  onBeforeMount(async () => {
    try {
      const { data } = await supabase.from('keuringen').select('*').eq('id', route.params.id).single()

      if (data) {
        keuringForm.type = [...data.type.split('/').map((value: TypeKeuring) => value.trim())]
        keuringForm.toegang_eenheid = data.toegang_eenheid
        keuringForm.klantID = data.klant_ID
        keuringForm.adresID = data.adres_ID
        keuringForm.facturatieID = data.facturatie_ID
        keuringForm.facturatie_bestemming = data.facturatie_bestemming
        keuringForm.opmerking = data.opmerking
        keuringForm.datum_plaatsbezoek = data.datum_plaatsbezoek
        keuringForm.status = data.status
        keuringForm.event_ID = data.event_ID
        keuringForm.asbest_event_ID = data.asbest_event_ID
        keuringForm.epc_toegewezen_aan = data.epc_toegewezen_aan
        keuringForm.asbest_toegewezen_aan = data.asbest_toegewezen_aan
      }

      const { data: certificatenData } = await supabase.from('certificaten').select('*').eq('keuringID', route.params.id)

      if (certificatenData) {
        certificatenData.map((certificaat) => {
          certificatenStore.addCertificaat({
            id: certificaat.id,
            naam: certificaat.name,
            type: certificaat.type,
            size: certificaat.size,
            keuringID: certificaat.keuringID
          })
        })
      }

      const { data: extraDocumentenData } = await supabase.from('extra_documenten').select('*').eq('adres_ID', keuringForm.adresID)

      if (extraDocumentenData) {
        extraDocumentenData.map((extraDoc) => {
          extraDocumentenStore.addExtraDocument({
            id: extraDoc.id,
            naam: extraDoc.naam,
            type: extraDoc.type,
            size: extraDoc.size,
            adresID: extraDoc.adres_ID
          })
        })
      }
    } finally {
      loadingKeuring.value = false
    }
  })

  onMounted(() => {
    const t1 = gsap.timeline({ repeat: -1, defaults: { duration: 0.3 } })

    t1.set('.loading p span', { opacity: 0 })

    t1.to('.loading p span:nth-child(1)', { opacity: 1 })
    t1.to('.loading p span:nth-child(2)', { opacity: 1 })
    t1.to('.loading p span:nth-child(3)', { opacity: 1 })

    t1.to('.loading p span', { opacity: 0 })

    t1.play()
  })

  const keuringAddress = computed(() => {
    return adressenStore.adressen.find((adres) => adres.id === keuringForm.adresID)
  })

  const keuringClient = computed(() => {
    return klantenStore.klanten.find((klant) => klant.id === keuringForm.klantID)
  })

  const keuringFacturatie = computed(() => {
    return facturatiesStore.facturaties.find((facturatie) => facturatie.id === keuringForm.facturatieID)
  })

  const vlaamseStad = computed(() => {
    if (keuringAddress.value) {
      return vlaamseStedenStore.getStadById(keuringAddress.value.vlaamse_stad_ID)
    }
    return ''
  })

  const facVlaamseStad = computed(() => {
    if (keuringFacturatie.value) {
      return vlaamseStedenStore.getStadById(keuringFacturatie.value.vlaamse_stad_ID)
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

  const handleDate = () => {
    datum_plaatsbezoek_edited.value = true
    keuringForm.status = Status.INGEPLAND
  }

  const handleDateClear = () => {
    keuringForm.status = Status.NIEUW
  }

  const uploadCertificaat = async (event: Event, typeKeuring: TypeKeuring) => {
    const { files } = event.target as HTMLInputElement
    if (files) {
      const fileListArray = Array.from(files || [])

      for (const file of fileListArray) {
        if (typeKeuring === TypeKeuring.EPC) {
          const { error } = await supabase.storage.from('certificaten').upload(`EPC/${file.name}`, file)

          if (error) {
            console.log('Could not upload EPC certificate')
          } else {
            certificatenStore.addCertificaat({
              naam: file.name,
              size: file.size,
              type: TypeKeuring.EPC,
              keuringID: route.params.id as string
            })

            const { error: errorUploadedEPCCertificaat } = await supabase.from('certificaten').insert({
              name: file.name,
              size: file.size,
              type: TypeKeuring.EPC,
              keuringID: route.params.id as string
            })

            if (errorUploadedEPCCertificaat) {
              console.error('Could not upload EPC certificaat')
            }

            keuringForm.status = Status.CERTIFICAAT_BESCHIKBAAR
          }
        } else {
          const { error } = await supabase.storage.from('certificaten').upload(`Asbest/${file.name}`, file)
          if (error) {
            console.log('Could not upload Asbest certificate')
          } else {
            certificatenStore.addCertificaat({
              naam: file.name,
              size: file.size,
              type: TypeKeuring.ASBEST,
              keuringID: route.params.id as string
            })

            const { error: errorUploadedAsbestCertificaat } = await supabase.from('certificaten').insert({
              name: file.name,
              size: file.size,
              type: TypeKeuring.ASBEST,
              keuringID: route.params.id as string
            })

            if (errorUploadedAsbestCertificaat) {
              console.error('Could not upload Asbest certificaat')
            }

            keuringForm.status = Status.CERTIFICAAT_BESCHIKBAAR
          }
        }
      }
    }
  }

  const removeCertificaat = async (event: Event, name: string, typeKeuring: TypeKeuring) => {
    event.preventDefault()

    const certificaat = certificatenStore.certificaten.find((cert) => cert.naam === name)

    if (certificaat) {
      if (typeKeuring === TypeKeuring.EPC) {
        const { error } = await supabase.storage.from('certificaten').remove([`EPC/${certificaat.naam}`])

        if (error) {
          console.error(`Unable to remove ${certificaat.naam} from the storage`)
        } else {
          const { error } = await supabase.from('certificaten').delete().eq('id', certificaat.id)

          if (!error) certificatenStore.removeCertificaat(name)
        }
      } else {
        const { error } = await supabase.storage.from('certificaten').remove([`Asbest/${certificaat.naam}`])

        if (error) {
          console.error(`Unable to remove ${certificaat.naam} from the storage`)
        } else {
          const { error } = await supabase.from('certificaten').delete().eq('id', certificaat.id)

          if (!error) certificatenStore.removeCertificaat(name)
        }
      }
    }
  }

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

  const removeDocument = async (event: Event, index: number) => {
    event.preventDefault()

    const extraDocument = extraDocumentenStore.extra_documenten[index].naam

    const { error } = await supabase.storage.from('extra-documenten').remove([`${extraDocumentenStore.extra_documenten[index].naam}`])
    if (error) {
      console.error(`Unable to remove ${extraDocumentenStore.extra_documenten[index].naam} from the storage`)
    } else {
      const { error } = await supabase.from('extra_documenten').delete().eq('naam', extraDocument)

      if (!error) extraDocumentenStore.removeExtraDocument(extraDocumentenStore.extra_documenten[index].naam)
    }
  }

  const handleChangeFacturatieBestemming = (event: Event) => {
    event.preventDefault()

    if (keuringForm.facturatie_bestemming !== FacturatieBestemming.ANDERS) {
      keuringForm.facturatieID = null
    } else {
      keuringForm.facturatieID = ''
    }
  }

  const editEPCEventToDate = async (id: string, newPbDate: Date) => {
    const endTime = new Date(newPbDate)
    endTime.setMinutes(newPbDate.getMinutes() + 45)

    await axios.put(
      `http://localhost:3000/events/epc/${id}`,
      {
        start: {
          dateTime: newPbDate,
          timeZone: 'Europe/Brussels'
        },
        end: {
          dateTime: endTime,
          timeZone: 'Europe/Brussels'
        }
      },
      { headers: { Authorization: `Bearer ${process.env.GOOGLE_CLIENT_SECRET}` } }
    )
  }

  const addEventToDate = async (keuring: FormKeuring) => {
    if (keuringClient.value) {
      if (keuring.datum_plaatsbezoek && keuringAddress.value && vlaamseStad.value) {
        const endTime = new Date(keuring.datum_plaatsbezoek)
        endTime.setMinutes(keuring.datum_plaatsbezoek.getMinutes() + 45)

        const event = {
          summary: `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}, ${vlaamseStad.value.postcode} ${vlaamseStad.value.gemeente}`,
          location: `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}, ${vlaamseStad.value.postcode} ${vlaamseStad.value.gemeente}`,
          description: `${keuringForm.type.join(' + ')} keuring\n${keuringClient.value.voornaam} ${keuringClient.value.achternaam}\n${keuringClient.value.emailadres}\n${String(
            keuringClient.value.telefoonnummer
          ).replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`,
          start: {
            dateTime: keuring.datum_plaatsbezoek,
            timeZone: 'Europe/Brussels'
          },
          end: {
            dateTime: endTime,
            timeZone: 'Europe/Brussels'
          }
        }

        if (keuring.type.includes(TypeKeuring.EPC)) {
          await axios.post('http://localhost:3000/events/epc', event, { headers: { Authorization: `Bearer ${process.env.GOOGLE_CLIENT_SECRET}` } }).then((e) => (keuringForm.event_ID = e.data.id))
        }

        if (keuring.type.includes(TypeKeuring.ASBEST)) {
          await axios
            .post('http://localhost:3000/events/asbest', event, { headers: { Authorization: `Bearer ${process.env.GOOGLE_CLIENT_SECRET}` } })
            .then((e) => (keuringForm.asbest_event_ID = e.data.id))
        }
      }
    }
  }

  const editAsbestEventToDate = async (id: string, newPbDate: Date) => {
    const endTime = new Date(newPbDate)
    endTime.setMinutes(newPbDate.getMinutes() + 45)

    await axios.put(
      `http://localhost:3000/events/asbest/${id}`,
      {
        start: {
          dateTime: newPbDate,
          timeZone: 'Europe/Brussels'
        },
        end: {
          dateTime: endTime,
          timeZone: 'Europe/Brussels'
        }
      },
      { headers: { Authorization: `Bearer ${process.env.GOOGLE_CLIENT_SECRET}` } }
    )
  }

  const submitForm = async (event: Event) => {
    event.preventDefault()

    if (datum_plaatsbezoek_edited.value && keuringForm.datum_plaatsbezoek) {
      if (keuringForm.event_ID) {
        await editEPCEventToDate(keuringForm.event_ID, keuringForm.datum_plaatsbezoek)
      } else if (keuringForm.type.includes(TypeKeuring.EPC)) {
        await addEventToDate(keuringForm)
      }
      if (keuringForm.asbest_event_ID) {
        await editAsbestEventToDate(keuringForm.asbest_event_ID, keuringForm.datum_plaatsbezoek)
      } else if (keuringForm.type.includes(TypeKeuring.ASBEST)) {
        await addEventToDate(keuringForm)
      }
    }

    updateKeuring()
  }

  const updateKeuring = async () => {
    const { data: updatedKeuring } = await supabase
      .from('keuringen')
      .update({
        datum_plaatsbezoek: keuringForm.datum_plaatsbezoek,
        adres_ID: keuringForm.adresID,
        status: keuringForm.status,
        type:
          keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)
            ? TypeKeuring.EPC_ASBEST
            : keuringForm.type.includes(TypeKeuring.EPC)
              ? TypeKeuring.EPC
              : TypeKeuring.ASBEST,
        opmerking: keuringForm.opmerking,
        toegang_eenheid: keuringForm.toegang_eenheid,
        created_by: keuringForm.created_by.id,
        klant_ID: keuringForm.klantID,
        facturatie_ID: keuringForm.facturatieID,
        facturatie_bestemming: keuringForm.facturatie_bestemming,
        event_ID: keuringForm.event_ID,
        asbest_event_ID: keuringForm.asbest_event_ID,
        epc_toegewezen_aan: keuringForm.epc_toegewezen_aan,
        asbest_toegewezen_aan: keuringForm.asbest_toegewezen_aan
      })
      .eq('id', route.params.id)
      .select(
        '*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*)), facturatie: facturaties(*), event_ID, asbest_event_ID'
      )
      .single()

    if (updatedKeuring) {
      toast.add({ severity: 'success', detail: `Keuring gewijzigd!`, group: 'br', life: 5000 })
      const k = {
        id: updatedKeuring.id,
        klantID: updatedKeuring.klant_ID,
        adresID: updatedKeuring.adres_ID,
        status: updatedKeuring.status,
        type: updatedKeuring.type,
        toegang_eenheid: updatedKeuring.toegang_eenheid,
        datum_toewijzing: new Date(updatedKeuring.created_at),
        datum_plaatsbezoek: updatedKeuring.datum_plaatsbezoek ? new Date(updatedKeuring.datum_plaatsbezoek) : null,
        created_by: updatedKeuring.created_by,
        opmerking: updatedKeuring.opmerking,
        facturatieID: updatedKeuring.facturatie_ID,
        event_ID: updatedKeuring.event_ID,
        asbest_event_ID: updatedKeuring.asbest_event_ID,
        epc_toegewezen_aan: updatedKeuring.epc_toegewezen_aan,
        asbest_toegewezen_aan: updatedKeuring.asbest_toegewezen_aan
      }
      keuringenStore.editKeuring(route.params.id as string, k)

      certificatenStore.empty()
      extraDocumentenStore.empty()
      router.push('/keuringen')
    }
  }

  const selectAddress = (id: string) => {
    keuringForm.adresID = id
  }

  const selectClient = (id: string) => {
    keuringForm.klantID = id
  }

  const selectFacturatie = (id: string) => {
    keuringForm.facturatieID = id
  }

  const handleClick = () => {
    certificatenStore.empty()
    extraDocumentenStore.empty()
    router.push('/keuringen')
  }

  const handleFormClose = () => {
    isCancelModalOpen.value = true
  }

  const handleDialogClick = () => {
    toast.add({ severity: 'error', detail: `Wijziging keuring geannuleerd!`, group: 'br', life: 5000 })
    extraDocumentenStore.empty()
    certificatenStore.empty()
    router.push('/keuringen')
  }

  const handleCloseClientClick = () => {
    keuringForm.klantID = ''
    keuringForm.facturatieID = null
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
  }

  const handleCloseFacturatieClick = () => {
    keuringForm.facturatieID = null
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
  }

  const handleCertificatenClick = () => {
    certificatesFormVisible.value = !certificatesFormVisible.value
    extraDocsFormVisible.value = false
  }

  const handleExtraDocumentenClick = () => {
    extraDocsFormVisible.value = !extraDocsFormVisible.value
    certificatesFormVisible.value = false
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
</script>

<template>
  <div class="container edit-keuring">
    <div class="title">
      <WEVBackButton @click="handleClick" />
      <h1>Keuring wijzigen</h1>
    </div>
    <form @submit="submitForm" v-if="!loadingKeuring">
      <div class="keuring">
        <div class="type">
          <span class="cb-epc">
            <Checkbox v-model="keuringForm.type" inputId="tkEpc" :value="TypeKeuring.EPC" />
            <label for="tkEpc" class="ml-2">{{ TypeKeuring.EPC }}</label>
          </span>
          <span class="cb-asbest">
            <Checkbox v-model="keuringForm.type" inputId="tkAsbest" :value="TypeKeuring.ASBEST" />
            <label for="tkAsbest" class="ml-2">{{ TypeKeuring.ASBEST }}</label>
          </span>
        </div>
        <div class="toegewezen-aan-wrapper" v-if="(keuringForm.epc_toegewezen_aan || keuringForm.asbest_toegewezen_aan) && authStore.currentlyLoggedIn.id === 'f7874a89-e5e9-4b1b-a773-77471bf35873'">
          <div class="data-row">
            <div class="toegewezen-aan" v-if="keuringForm.epc_toegewezen_aan">
              EPC
              <Dropdown v-model="keuringForm.epc_toegewezen_aan" :options="deskundigenStore.deskundigen.filter((d: Gebruiker) => d.specialisatie.includes(TypeKeuring.EPC))" optionValue="id">
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
            </div>
            <div class="toegewezen-aan" v-if="keuringForm.asbest_toegewezen_aan">
              Asbest
              <Dropdown v-model="keuringForm.asbest_toegewezen_aan" :options="deskundigenStore.deskundigen.filter((d: Gebruiker) => d.specialisatie.includes(TypeKeuring.ASBEST))" optionValue="id">
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
            </div>
          </div>
        </div>
        <div class="toegang-eenheid">
          <span class="rb-klant">
            <RadioButton v-model="keuringForm.toegang_eenheid" input-id="teKlant" :value="ToegangEenheid.KLANT" />
            <label for="teKlant">Afspreken met klant</label>
          </span>
          <span class="rb-sleutels">
            <RadioButton v-model="keuringForm.toegang_eenheid" input-id="teSleutels" :value="ToegangEenheid.SLEUTELS" />
            <label for="teSleutels">Sleutels ophalen</label>
          </span>
        </div>
        <div v-if="keuringAddress && vlaamseStad" class="adres-wrapper">
          <div class="data-row">
            <div class="adres">
              {{ `${keuringAddress.straatnaam} ${keuringAddress.nummer}, ${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
            </div>
            <div class="edit-close">
              <div @click="keuringForm.adresID = ''">
                <Icon icon="mdi:close" width="20" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="adres-error">
          <div class="data-row">
            <div class="adres">Geen adres geselecteerd</div>
          </div>
        </div>
        <div v-if="keuringClient" class="klant-wrapper">
          <div class="data-row">
            <div>
              <div class="name">
                {{ `${keuringClient.voornaam} ${keuringClient.achternaam}` }}
              </div>
              <div class="email-tel" v-if="editClientEmailPhoneNumber">
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-envelope"></InputIcon>
                  <InputText type="text" v-model="keuringClient.emailadres" />
                </IconField>
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-phone"></InputIcon>
                  <InputText type="text" v-model="keuringClient.telefoonnummer" />
                </IconField>
              </div>
              <div class="email-tel" v-else>
                <span>
                  {{ keuringClient.emailadres }}
                </span>
                <span>
                  {{ keuringClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
                </span>
              </div>
            </div>
            <div class="edit-close">
              <div @click="handleConfirmEdit" v-if="editClientEmailPhoneNumber">
                <Icon icon="mdi:check" width="20" />
              </div>
              <div @click="editClientEmailPhoneNumber = true" v-else>
                <Icon icon="mdi:pencil" width="20" />
              </div>
              <div @click="handleCloseClientClick">
                <Icon icon="mdi:close" width="20" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="klant-error">
          <div class="data-row">
            <div class="name">Geen klant geselecteerd</div>
          </div>
        </div>
        <div class="facturatie-wrapper">
          <h3>Facturatie</h3>
          <div style="display: flex; flex-direction: column; gap: 1.5rem">
            <div class="data-row">
              <div class="rbs-bestemming">
                <span class="rb-hetzelfde">
                  <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_hetzelfde" :value="FacturatieBestemming.HETZELFDE" @change="handleChangeFacturatieBestemming" />
                  <label for="fac_hetzelfde" class="ml-2">Klant</label>
                </span>
                <span class="rb-immo">
                  <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_immo" :value="FacturatieBestemming.IMMO" @change="handleChangeFacturatieBestemming" />
                  <label for="fac_immo" class="ml-2">Immo</label>
                </span>
                <span class="rb-anders" v-if="keuringClient">
                  <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_anders" :value="FacturatieBestemming.ANDERS" @change="handleChangeFacturatieBestemming" />
                  <label for="fac_anders" class="ml-2">Anders</label>
                </span>
              </div>
              <div v-if="keuringForm.facturatie_bestemming !== FacturatieBestemming.HETZELFDE" @click="handleCloseFacturatieClick">
                <Icon icon="mdi:close" width="20" />
              </div>
            </div>
            <div v-if="keuringForm.facturatie_bestemming === FacturatieBestemming.ANDERS" style="padding-left: 2rem">
              <div v-if="keuringFacturatie" class="fac_name">
                {{ `${keuringFacturatie.voornaam} ${keuringFacturatie.achternaam}` }}
              </div>
              <div v-if="keuringFacturatie" class="fac_email_tel">
                {{
                  `${keuringFacturatie.emailadres} -
                ${keuringFacturatie.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`
                }}
              </div>
              <div v-if="keuringFacturatie && facVlaamseStad" class="fac_adres">
                {{ `${keuringFacturatie.straatnaam} ${keuringFacturatie.nummer}, ${facVlaamseStad.postcode} ${facVlaamseStad.gemeente}` }}
              </div>
            </div>
          </div>
        </div>
        <div class="opmerking">
          <div>
            <Textarea id="ta-opmerking" v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
          </div>
        </div>
        <div class="datum-plaatsbezoek-wrapper" v-if="vlaamseStad && keuringAddress && keuringClient">
          <h3>Datum Plaatsbezoek</h3>
          <VueDatePicker
            uid="wev-edit-keuring-datepicker"
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
        <div class="uploader-wrapper">
          <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="warning" @click="handleCertificatenClick">
            <span class="text">
              <Icon icon="mdi:certificate" width="20" />
              Certificaten
            </span>
            <span v-if="keuringForm.type.length">
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                {{ certificatenStore.certificaten.filter((cert: Certificaat) => cert.type.includes(TypeKeuring.EPC)).length }}
              </span>
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)"> | </span>
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.ASBEST)">
                {{ certificatenStore.certificaten.filter((cert: Certificaat) => cert.type.includes(TypeKeuring.ASBEST)).length }}
              </span>
            </span>
          </Button>
          <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="info" @click="handleExtraDocumentenClick">
            <span class="text">
              <Icon icon="mdi:file-document" width="20" />
              Extra documenten
            </span>
            <span class="amount">({{ extraDocumentenStore.extra_documenten.length }})</span>
          </Button>
        </div>
      </div>
      <div class="actions">
        <ul>
          <li title="Keuring uploaden">
            <button :disabled="editClientEmailPhoneNumber" type="submit" style="background-color: seagreen">
              <Icon icon="mdi:send" width="22" color="white" />
            </button>
          </li>
          <li title="Annuleren" @click="handleFormClose">
            <button type="button" style="background-color: crimson">
              <Icon icon="mdi:close" width="22" color="white" />
            </button>
          </li>
          <WEVCancelModal :isOpen="isCancelModalOpen" @closeWindow="isCancelModalOpen = false" @confirm="handleDialogClick" />
        </ul>
      </div>
      <div class="sub-form">
        <WEVAddressForm v-if="!keuringForm.adresID" :form="keuringForm" @select-address="selectAddress" />
        <WEVClientForm v-if="keuringForm.adresID && !keuringForm.klantID" :form="keuringForm" @select-client="selectClient" />
        <WEVFacturatieForm
          @select-facturatie="selectFacturatie"
          v-if="keuringForm.facturatie_bestemming === FacturatieBestemming.ANDERS && !keuringForm.facturatieID"
          :keuringClient="keuringClient"
          :keuringAddress="keuringAddress"
          :form="keuringForm"
          :klanten="klantenStore.klanten"
          :adressen="adressenStore.adressen"
        />
        <WEVExtraDocsForm
          v-if="extraDocsFormVisible"
          :form="keuringForm"
          @uploadExtraDocumenten="(event: Event) => uploadExtraDocumenten(event)"
          @removeDocument="(event: Event, i: number) => removeDocument(event, i)"
        />
        <WEVCertificatesForm
          v-if="certificatesFormVisible && keuringForm.klantID && keuringForm.adresID"
          :form="keuringForm"
          @uploadCertificaten="(event: Event, type: TypeKeuring) => uploadCertificaat(event, type)"
          @removeCertificaat="(event: Event, name: string, type: TypeKeuring) => removeCertificaat(event, name, type)"
        />
      </div>
    </form>
    <div class="loading" v-else>
      <p>Keuring aan het laden<span>.</span><span>.</span><span>.</span></p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .loading {
    p {
      font-size: 1.4rem;
    }
  }

  .title {
    height: 120px;
    display: flex;
    align-items: center;
    position: relative;
  }

  .data-row {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    > div {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .edit-close {
      display: flex;
      flex-direction: row;
      gap: 1rem;

      div {
        display: flex;
        border-radius: 50%;
        padding: 0.5rem;
        cursor: pointer;

        &:hover {
          background-color: seagreen;
          color: #fff;
        }
      }
    }
  }

  .edit-keuring {
    font-family: 'Rubik', sans-serif;
    margin-bottom: 5rem;

    form {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .actions {
      width: 60px;

      ul {
        flex: 1;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        li {
          display: flex;
          align-items: center;

          button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 34px;
            height: 34px;
            border-radius: 15%;
            border: none;
            cursor: pointer;
          }
        }
      }
    }

    .sub-form {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      flex: 1;
    }

    .keuring {
      width: 475px;
      display: flex;
      flex-direction: column;
      padding: 4.5rem;
      box-shadow:
        0 0 58px 0 rgba(0, 0, 0, 0.18),
        0 0 14px 0 rgba(0, 0, 0, 0.18);
      gap: 3rem;

      label,
      textarea,
      .adres,
      .name {
        font-size: 1.4rem;
      }

      .toegewezen-aan {
        width: 50%;
      }

      .toegewezen-aan,
      .adres,
      .klant,
      .name,
      .fac_name,
      .fac_adres {
        font-weight: 600;
      }

      .fac_name,
      .fac_adres {
        font-size: 1.2rem;
      }

      .fac_adres {
        margin-top: 0.5rem;
      }

      .email-tel {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        justify-content: flex-start;
        padding-top: 0.25rem;
        color: #4b5563;

        > span {
          height: 24px;
          padding-block: 0.5rem;
          padding-inline: 25px;
          border: 1px solid transparent;
        }

        input {
          padding-block: 0.5rem;
          font-size: 1rem;
          font-family: 'Rubik', sans-serif;
        }
      }

      .type {
        display: flex;
        gap: 20px;

        .cb-epc,
        .cb-asbest {
          display: flex;
          align-items: center;
          accent-color: seagreen;

          label {
            margin-left: 1rem;
          }
        }
      }

      .toegang-eenheid {
        display: flex;
        gap: 20px;

        div {
          display: flex;
          gap: 1rem;
        }

        .rb-klant,
        .rb-sleutels {
          display: flex;
          align-items: center;
          accent-color: seagreen;

          label {
            margin-left: 1rem;
          }

          input {
            margin: 0;
          }
        }
      }

      .toegewezen-aan-wrapper,
      .opmerking,
      .adres-wrapper,
      .adres-error,
      .klant-error,
      .klant-wrapper,
      .facturatie-wrapper {
        display: flex;
        justify-content: space-between;
        padding-left: 1rem;
      }

      .toegewezen-aan-wrapper,
      .opmerking,
      .adres-wrapper,
      .klant-wrapper,
      .facturatie-wrapper {
        border-left: 2px solid seagreen;
      }

      .adres-error,
      .klant-error {
        border-left: 2px solid crimson;
        color: crimson;
      }

      .uploader-wrapper {
        display: flex;
        gap: 1rem;

        button {
          flex: 1;
          display: flex;
          font-weight: bold;

          .text {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
          }
        }
      }

      .opmerking {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        textarea {
          display: block;
          font-family: 'Rubik', sans-serif;
          padding: 1rem;
          resize: none;
          width: 100%;
          height: 100px;
        }
      }

      .facturatie-wrapper {
        flex-direction: column;
        gap: 1.5rem;

        > div {
          padding-left: 0.5rem;
        }

        .rbs-bestemming {
          display: flex;
          flex-direction: row;
          gap: 20px;

          .rb-hetzelfde,
          .rb-immo,
          .rb-anders {
            display: flex;
            accent-color: seagreen;

            label {
              display: flex;
              align-items: center;
              margin-left: 1rem;
            }
          }
        }
      }

      .datum-plaatsbezoek-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    }

    .datum-plaatsbezoek {
      display: flex;
      gap: 20px;

      > div {
        flex: 1;
        border-left: solid 1px #0000006c;
        padding-left: 20px;
      }
    }

    :deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
      padding: 0.75rem 1.25rem;
    }
  }
</style>
