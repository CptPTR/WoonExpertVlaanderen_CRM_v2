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
  import { Status } from '@/enums/modules/Status'
  import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
  import { TypeKeuring } from '@/enums/modules/TypeKeuring'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { useDeskundigenStore } from '@/stores/deskundigenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { FormKeuring, Gebruiker } from '@/types'
  import { Icon } from '@iconify/vue'
  import 'add-to-calendar-button'
  import axios from 'axios'
  import { gsap } from 'gsap'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea'
  import { useToast } from 'primevue/usetoast'
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import SelectedFacturatie from '@/components/SelectedFacturatie.vue'

  const authStore = useAuthStore()
  const deskundigenStore = useDeskundigenStore()
  const keuringenStore = useKeuringenStore()
  const adressenStore = useAdressenStore()
  const klantenStore = useKlantenStore()
  const certificatenStore = useCertificaatStore()
  const extraDocumentenStore = useExtraDocumentStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const loadingKeuring = ref<boolean>(true)
  const editClientEmailPhoneNumber = ref<boolean>(false)
  const datum_plaatsbezoek_edited = ref<boolean>(false)
  const certificateFilesAdded = ref<number>(0)
  const keuringForm: FormKeuring = reactive({
    type: [],

    klantID: '',
    adresID: '',
    facturatieID: '',
    facturatie_bestemming: FacturatieBestemming.HETZELFDE,

    status: Status.NIEUW,
    opmerking: '',
    toegang_eenheid: ToegangEenheid.KLANT,
    datum_plaatsbezoek: new Date(),
    epc_certificaten: [],
    asbest_certificaten: [],
    extra_documenten: [],
    created_by: null,
    admin_event_ID: null,
    event_ID: null,
    asbest_event_ID: null,
    epc_toegewezen_aan: null,
    asbest_toegewezen_aan: null
  })

  const isCancelModalOpen = ref<boolean>(false)
  const isAddressSubFormVisible = ref<boolean>(false)
  const isClientSubFormVisible = ref<boolean>(false)
  const isFacturatieSubFormVisible = ref<boolean>(false)
  const isCertificatesUploaderVisible = ref<boolean>(false)
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

  const sendNotifToCreator = async (to: string, subject: string, location: string, klant: string, type: string, link: string) => {
    await axios.post(`${process.env.BACKEND_BASE_URL}/notify-certificate-available`, { to, subject, location, klant, type, link })
  }

  const notifyKeuringCreatorCertificateIsAvailable = async () => {
    if (keuringForm.created_by && keuringAddress.value && keuringClient.value && vlaamseStad.value) {
      await sendNotifToCreator(
        keuringForm.created_by.email,
        'Nieuw attest beschikbaar',
        `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}${keuringAddress.value.busnummer ? ` ${keuringAddress.value.busnummer}` : ''}, ${vlaamseStad.value.postcode} ${
          vlaamseStad.value.gemeente
        }`,
        `${keuringClient.value.voornaam} ${keuringClient.value.achternaam}`,
        keuringForm.type.join(' + '),
        `${process.env.FRONTEND_BASE_URL}/keuringen/${route.params.id}`
      )
    }
  }

  watch(
    () => keuringForm.type,
    (newType, oldType) => {
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

  onBeforeMount(async () => {
    certificatenStore.empty()
    extraDocumentenStore.empty()

    try {
      const { data } = await supabase.from('keuringen').select('*, created_by: gebruikers!keuringen_created_by_fkey(*, organisatie: organisaties(naam))').eq('id', route.params.id).single()

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
        keuringForm.created_by = {
          id: data.created_by.id,
          gebruikersnaam: data.created_by.gebruikersnaam,
          voornaam: data.created_by.voornaam,
          achternaam: data.created_by.achternaam,
          telefoonnummer: data.created_by.telefoonnummer,
          email: data.created_by.email,
          rol: data.created_by.rol,
          avatar: data.created_by.avatar,
          specialisatie: data.created_by.specialisatie,
          organisatie: {
            id: data.created_by.organisatie.id,
            naam: data.created_by.organisatie.naam
          }
        }
        ;(keuringForm.admin_event_ID = data.admin_event_ID), (keuringForm.event_ID = data.event_ID)
        keuringForm.asbest_event_ID = data.asbest_event_ID
        keuringForm.epc_toegewezen_aan = data.epc_toegewezen_aan
        keuringForm.asbest_toegewezen_aan = data.asbest_toegewezen_aan
      }

      const { data: certificatenData } = await supabase.from('certificaten').select('*').eq('keuringID', route.params.id)

      if (certificatenData) {
        certificatenData.map((certificaat) => {
          certificatenStore.addCertificaat({
            id: certificaat.id,
            created_at: certificaat.created_at,
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

  const vlaamseStad = computed(() => {
    if (keuringAddress.value) {
      return vlaamseStedenStore.getStadById(keuringAddress.value.vlaamse_stad_ID)
    }
    return null
  })

  const dropdownEPCValue = computed(() => {
    const value = deskundigenStore.deskundigen.filter((d: Gebruiker) => d.id === keuringForm.epc_toegewezen_aan)[0]
    return `${value.voornaam} ${value.achternaam}`
  })

  const dropdownAsbestValue = computed(() => {
    const value = deskundigenStore.deskundigen.filter((d: Gebruiker) => d.id === keuringForm.asbest_toegewezen_aan)[0]
    return `${value.voornaam} ${value.achternaam}`
  })

  const handleDateClear = () => {
    keuringForm.status = Status.NIEUW
  }

  const handleDateClick = () => {
    datum_plaatsbezoek_edited.value = true
    keuringForm.status = Status.INGEPLAND
  }

  const epc_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.EPC))
  })

  const asbest_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.ASBEST))
  })

  const uploadCertificaat = async (event: Event, typeKeuring: TypeKeuring) => {
    const { files } = event.target as HTMLInputElement
    if (files) {
      const fileListArray = Array.from(files || [])

      for (const file of fileListArray) {
        if (typeKeuring === TypeKeuring.EPC) {
          const { error } = await supabase.storage.from('certificaten').upload(`EPC/${file.name}`, file)

          if (error) {
            console.error('Could not upload EPC certificate')
          } else {
            certificatenStore.addCertificaat({
              created_at: new Date(Date.now()),
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
            certificateFilesAdded.value++
          }
        } else {
          const { error } = await supabase.storage.from('certificaten').upload(`Asbest/${file.name}`, file)
          if (error) {
            console.error('Could not upload Asbest certificate')
          } else {
            certificatenStore.addCertificaat({
              created_at: new Date(Date.now()),
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
            certificateFilesAdded.value++
          }
        }
      }
    }
  }

  const removeCertificaat = async (event: Event, id: string, typeKeuring: TypeKeuring) => {
    event.preventDefault()

    const certificaat = certificatenStore.certificaten.find((cert) => cert.id === id)

    if (certificaat) {
      if (typeKeuring === TypeKeuring.EPC) {
        const { error } = await supabase.storage.from('certificaten').remove([`EPC/${certificaat.naam}`])

        if (error) {
          console.error(`Unable to remove ${certificaat.naam} from the storage`)
        } else {
          const { error } = await supabase.from('certificaten').delete().eq('id', certificaat.id)

          if (!error && certificaat.id) certificatenStore.removeCertificaatById(certificaat.id)
        }
      } else {
        const { error } = await supabase.storage.from('certificaten').remove([`Asbest/${certificaat.naam}`])

        if (error) {
          console.error(`Unable to remove ${certificaat.naam} from the storage`)
        } else {
          const { error } = await supabase.from('certificaten').delete().eq('id', certificaat.id)

          if (!error && certificaat.id) certificatenStore.removeCertificaatById(certificaat.id)
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

  const removeDocument = async (event: Event, name: string) => {
    event.preventDefault()

    const { error } = await supabase.storage.from('extra-documenten').remove([`${name}`])
    if (error) {
      console.error(`Unable to remove ${name} from the storage`)
    } else {
      const { error } = await supabase.from('extra_documenten').delete().eq('naam', name)

      if (!error) extraDocumentenStore.removeExtraDocument(name)
    }
  }

  const handleChangeFacturatieBestemming = (event: Event) => {
    event.preventDefault()

    if (keuringForm.facturatie_bestemming !== FacturatieBestemming.ANDERS) {
      keuringForm.facturatieID = null
      hideFacturatieSubForm()
    } else {
      keuringForm.facturatieID = ''
      showFacturatieSubForm()
    }
  }

  const editEventToDate = async (username: string, eventId: string, newPbDate: Date) => {
    const endTime = new Date(newPbDate)
    endTime.setMinutes(newPbDate.getMinutes() + 45)

    try {
      await axios.put(`${process.env.BACKEND_BASE_URL}/calendars/${username}/events/${eventId}`, {
        eventStart: newPbDate,
        eventEnd: endTime
      })
    } catch (error) {
      console.error(error)
    }
  }

  const addEventToCalendar = async (keuring: FormKeuring, to: string, type?: TypeKeuring) => {
    if (keuringClient.value) {
      if (keuring.datum_plaatsbezoek && keuringAddress.value && vlaamseStad.value) {
        const endTime = new Date(keuring.datum_plaatsbezoek)
        endTime.setMinutes(keuring.datum_plaatsbezoek.getMinutes() + 45)

        const event = {
          summary: `${keuringForm.type.join(' + ')} - ${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer} ${
            keuringAddress.value.busnummer ? ' ' + keuringAddress.value.busnummer : ''
          }, ${vlaamseStad.value.postcode} ${vlaamseStad.value.gemeente}`,
          location: `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer} ${keuringAddress.value.busnummer ? ' ' + keuringAddress.value.busnummer : ''}, ${vlaamseStad.value.postcode} ${
            vlaamseStad.value.gemeente
          }`,
          description: `${keuringForm.type.join(' + ')} keuring\n${keuringClient.value.voornaam} ${keuringClient.value.achternaam}\n${keuringClient.value.emailadres}\n${String(
            keuringClient.value.telefoonnummer
          ).replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`,
          start: keuring.datum_plaatsbezoek,
          end: endTime
        }

        try {
          const response = await axios.post(`${process.env.BACKEND_BASE_URL}/calendars/${to}/events`, {
            eventSummary: event.summary,
            eventLocation: event.location,
            eventDescription: event.description,
            eventStart: event.start,
            eventEnd: event.end
          })
          if (type === TypeKeuring.EPC) {
            keuringForm.event_ID = response.data
          }
          if (type === TypeKeuring.ASBEST) {
            keuringForm.asbest_event_ID = response.data
          }
          if (!type) {
            keuringForm.admin_event_ID = response.data
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  const submitForm = async (event: Event) => {
    event.preventDefault()

    if (datum_plaatsbezoek_edited.value && keuringForm.datum_plaatsbezoek) {
      const epcDeskundige = deskundigenStore.deskundigen.find((deskundige) => keuringForm.epc_toegewezen_aan === deskundige.id)!
      const asbestDeskundige = deskundigenStore.deskundigen.find((deskundige) => keuringForm.asbest_toegewezen_aan === deskundige.id)!
      const wevAdmin = deskundigenStore.deskundigen.find((deskundige) => deskundige.gebruikersnaam === process.env.WEV_ADMIN)!

      if (keuringForm.admin_event_ID && (epcDeskundige?.gebruikersnaam !== wevAdmin.gebruikersnaam || asbestDeskundige?.gebruikersnaam !== wevAdmin.gebruikersnaam)) {
        await editEventToDate(wevAdmin.gebruikersnaam, keuringForm.admin_event_ID, keuringForm.datum_plaatsbezoek)
      } else {
        if (epcDeskundige?.gebruikersnaam !== wevAdmin.gebruikersnaam) {
          await addEventToCalendar(keuringForm, wevAdmin.gebruikersnaam)
        }
      }

      if (keuringForm.event_ID && keuringForm.epc_toegewezen_aan) {
        await editEventToDate(epcDeskundige.gebruikersnaam, keuringForm.event_ID, keuringForm.datum_plaatsbezoek)
      } else {
        if (keuringForm.type.includes(TypeKeuring.EPC)) {
          await addEventToCalendar(keuringForm, epcDeskundige.gebruikersnaam, TypeKeuring.EPC)
        }
      }

      if (keuringForm.asbest_event_ID && keuringForm.asbest_toegewezen_aan) {
        await editEventToDate(asbestDeskundige.gebruikersnaam, keuringForm.asbest_event_ID, keuringForm.datum_plaatsbezoek)
      } else {
        if (keuringForm.type.includes(TypeKeuring.ASBEST)) {
          await addEventToCalendar(keuringForm, asbestDeskundige.gebruikersnaam, TypeKeuring.ASBEST)
        }
      }
    }

    if (certificateFilesAdded.value > 0 && keuringForm.created_by?.organisatie.naam !== 'WoonExpertVlaanderen') {
      notifyKeuringCreatorCertificateIsAvailable()
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
        created_by: keuringForm.created_by?.id,
        organisatie_ID: keuringForm.created_by?.organisatie.id,
        klant_ID: keuringForm.klantID,
        facturatie_ID: keuringForm.facturatieID,
        facturatie_bestemming: keuringForm.facturatie_bestemming,
        admin_event_ID: keuringForm.admin_event_ID,
        event_ID: keuringForm.event_ID,
        asbest_event_ID: keuringForm.asbest_event_ID,
        epc_toegewezen_aan: keuringForm.epc_toegewezen_aan,
        asbest_toegewezen_aan: keuringForm.asbest_toegewezen_aan
      })
      .eq('id', route.params.id)
      .select('*, created_by: gebruikers!keuringen_created_by_fkey(*, organisatie: organisaties(*))')
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
        organisatie_ID: updatedKeuring.organisatie_ID,
        opmerking: updatedKeuring.opmerking,
        facturatieID: updatedKeuring.facturatie_ID,
        admin_event_ID: updatedKeuring.admin_event_ID,
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

  const handleClientCloseClick = () => {
    keuringForm.klantID = ''
    keuringForm.facturatieID = null
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
  }

  const handleAddressCloseClick = () => {
    keuringForm.adresID = ''
  }

  const handleDeselectionFacturatie = () => {
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
    hideFacturatieSubForm()
  }

  const handleCloseFacturatieSubForm = () => {
    handleDeselectionFacturatie()
  }

  const showCertificatenSubForm = () => {
    isCertificatesUploaderVisible.value = true
    isExtraDocsUploaderVisible.value = false
  }

  const showExtraDocumentenSubForm = () => {
    isExtraDocsUploaderVisible.value = true
    isCertificatesUploaderVisible.value = false
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
      <h1 class="text-2xl">Keuring wijzigen</h1>
    </div>
    <form @submit="submitForm" v-if="!loadingKeuring">
      <div class="content">
        <div class="column">
          <div class="type text-sm">
            <span class="cb-epc">
              <input type="checkbox" name="typeKeuring" id="tk_epc" :value="TypeKeuring.EPC" v-model="keuringForm.type" />
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
              <input type="checkbox" name="typeKeuring" id="tk_asbest" :value="TypeKeuring.ASBEST" v-model="keuringForm.type" />
              <label for="tk_asbest">{{ TypeKeuring.ASBEST }}</label>
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
                <input type="radio" name="toegangEenheid" id="te_klant" :value="ToegangEenheid.KLANT" v-model="keuringForm.toegang_eenheid" />
                <label for="te_klant">Afspreken met klant</label>
              </span>
              <span class="rb-sleutels">
                <input type="radio" name="toegangEenheid" id="te_immo" :value="ToegangEenheid.SLEUTELS" v-model="keuringForm.toegang_eenheid" />
                <label for="te_immo">Sleutels ophalen</label>
              </span>
            </div>
          </div>
          <div class="datum-plaatsbezoek-wrapper" v-if="vlaamseStad && keuringAddress && keuringClient && authStore.currentlyLoggedIn?.rol === 'deskundige'">
            <h3 class="text-base">Datum Plaatsbezoek</h3>
            <VueDatePicker
              uid="wev-edit-keuring-datepicker"
              v-model="keuringForm.datum_plaatsbezoek"
              :min-date="new Date()"
              @cleared="handleDateClear"
              @date-update="handleDateClick"
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
                    <label for="fac_immo" v-if="authStore.currentlyLoggedIn?.rol.includes('immo')">{{ authStore.currentlyLoggedIn?.organisatie.naam }}</label>
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
            <Textarea id="ta-opmerking" class="text-sm" v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
          </div>
          <div class="uploader-wrapper">
            <Button raised @click="showCertificatenSubForm" :disabled="!(keuringForm.adresID && keuringForm.klantID && keuringForm.type.length !== 0)">
              <span class="text text-xs">
                <Icon icon="mdi:certificate" width="20" />
                Certificaten
              </span>
              <span v-if="keuringForm.type.length" class="text-xs">
                <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                  {{ epc_certificaten.length }}
                </span>
                <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)"> | </span>
                <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.ASBEST)">
                  {{ asbest_certificaten.length }}
                </span>
              </span>
            </Button>
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
        <Button type="button" raised severity="danger" @click="handleFormClose" class="text-xs">Annuleer</Button>
        <Button type="submit" raised class="text-xs">Wijzig keuring</Button>
        <WEVCancelModal :isOpen="isCancelModalOpen" @closeWindow="isCancelModalOpen = false" @confirm="handleDialogClick" />
      </div>
    </form>
    <div class="loading" v-else>
      <p>Keuring aan het laden<span>.</span><span>.</span><span>.</span></p>
    </div>
    <div class="sub-form" v-if="isAddressSubFormVisible || isClientSubFormVisible">
      <WEVAddressForm v-if="isAddressSubFormVisible" :form="keuringForm" @select-address="selectAddress" @close-sub-form="hideAddressSubForm" />
      <WEVClientForm v-if="isClientSubFormVisible" :form="keuringForm" @select-client="selectClient" @close-sub-form="hideClientSubForm" />
    </div>
    <div class="sub-form" v-if="isFacturatieSubFormVisible || isCertificatesUploaderVisible || isExtraDocsUploaderVisible">
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
      <WEVCertificatesForm
        v-if="isCertificatesUploaderVisible"
        :form="keuringForm"
        @toggleSubForm="isCertificatesUploaderVisible = !isCertificatesUploaderVisible"
        @uploadCertificaten="(event: Event, type: TypeKeuring) => uploadCertificaat(event, type)"
        @removeCertificaat="(event: Event, name: string, type: TypeKeuring) => removeCertificaat(event, name, type)"
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
  .edit-keuring {
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

    button[type='submit'] {
      background-color: seagreen;
      border-color: seagreen;
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

  .type,
  .toegewezen-aan-wrapper,
  .toegang-eenheid,
  .opmerking,
  .adres,
  .klant,
  .facturatie-wrapper,
  .datum-plaatsbezoek-wrapper {
    display: flex;
    padding-left: 2rem;
  }

  .type,
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
    font-size: 0.875rem; //14px
    padding-block: 0.5rem;
    width: 200px;
  }
</style>
