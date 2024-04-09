<script lang="ts" setup>
  import WEVAddressForm from '@/components/WEVAddressForm.vue'
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import WEVCertificatesForm from '@/components/WEVCertificatesForm.vue'
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
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Adres, FormKeuring } from '@/types'
  import { Icon } from '@iconify/vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import 'add-to-calendar-button'
  import axios from 'axios'
  import Button from 'primevue/button'
  import Checkbox from 'primevue/checkbox'
  import RadioButton from 'primevue/radiobutton'
  import Textarea from 'primevue/textarea'
  import { useToast } from 'primevue/usetoast'
  import { computed, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const authStore = useAuthStore()
  const keuringenStore = useKeuringenStore()
  const certificatenStore = useCertificaatStore()
  const klantenStore = useKlantenStore()
  const adressenStore = useAdressenStore()
  const facturatiesStore = useFacturatiesStore()
  const extraDocumentenStore = useExtraDocumentStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const router = useRouter()
  const toast = useToast()

  const keuringForm: FormKeuring = reactive({
    type: [],
    voornaam: '',
    familienaam: '',
    emailadres: '',
    telefoonnummer: '',

    adresID: '',
    klantID: '',
    facturatieID: null,
    facturatie_bestemming: FacturatieBestemming.HETZELFDE,

    straatnaam: '',
    nummer: '',
    vlaamse_stad_ID: '',

    status: Status.NIEUW,
    opmerking: '',
    toegang_eenheid: ToegangEenheid.KLANT,
    datum_plaatsbezoek: null,
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
    event_ID: null,
    asbest_event_ID: null
  })

  const certificatesFormVisible = ref<boolean>(false)
  const extraDocsFormVisible = ref<boolean>(false)
  const isCancelModalOpen = ref<boolean>(false)
  const datum_plaatsbezoek_edited = ref<boolean>(false)

  const keuringAddress = computed(() => {
    return adressenStore.adressen.find((adres: Adres) => adres.id === keuringForm.adresID)
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

  const kAdres = computed(() => {
    if (keuringAddress.value && vlaamseStad.value) {
      return `${keuringAddress.value.straatnaam} ${keuringAddress.value.nummer}, ${vlaamseStad.value.postcode} ${vlaamseStad.value.gemeente}`
    }
    return ''
  })

  const epc_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.EPC))
  })

  const asbest_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.ASBEST))
  })

  const uploadExtraDocumenten = async (event: Event) => {
    const { files } = event.target as HTMLInputElement

    if (files) {
      const fileListArray = Array.from(files || [])
      for (const file of fileListArray) {
        const { error } = await supabase.storage.from('extra-documenten').upload(`/${file.name}`, file)
        if (error) {
          console.error('Could not upload document')
        } else {
          extraDocumentenStore.addExtraDocument({
            naam: file.name,
            size: file.size,
            type: file.type,
            adresID: keuringForm.adresID
          })
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

  const uploadCertificaat = async (event: Event, typeKeuring: TypeKeuring, keuring: string) => {
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
              keuringID: keuring
            })
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
              keuringID: keuring
            })
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
          certificatenStore.removeCertificaat(name)
        }
      } else {
        const { error } = await supabase.storage.from('certificaten').remove([`Asbest/${certificaat.naam}`])
        if (error) {
          console.error(`Unable to remove ${certificaat.naam} from the storage`)
        } else {
          certificatenStore.removeCertificaat(name)
        }
      }
    }
  }

  const uploadKeuring = async () => {
    const { data: uploadedKeuring } = await supabase
      .from('keuringen')
      .insert([
        {
          created_by: keuringForm.created_by.id,
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
          event_ID: keuringForm.event_ID,
          asbest_event_ID: keuringForm.asbest_event_ID
        }
      ])
      .select('*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*)), facturatie: facturaties(*)')
      .single()

    const { error: errorUploadedEPCCertificaat } = await supabase.from('certificaten').insert(
      epc_certificaten.value.map((cert) => ({
        name: cert.naam,
        size: cert.size,
        type: cert.type,
        keuringID: uploadedKeuring.id
      }))
    )

    if (errorUploadedEPCCertificaat) {
      console.error('Could not upload EPC certificaat')
    }

    const { error: errorUploadedAsbestCertificaat } = await supabase.from('certificaten').insert(
      asbest_certificaten.value.map((cert) => ({
        name: cert.naam,
        size: cert.size,
        type: cert.type,
        keuringID: uploadedKeuring.id
      }))
    )

    if (errorUploadedAsbestCertificaat) {
      console.error('Could not upload Asbest certificaat')
    }

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

    if (uploadedKeuring) {
      toast.add({ severity: 'success', summary: 'Keuring succesvol aangemaakt!', group: 'br', life: 5000 })

      keuringenStore.addKeuring({
        id: uploadedKeuring.id,
        // klant: {
        //   id: uploadedKeuring.klant.id,
        //   voornaam: uploadedKeuring.klant.voornaam,
        //   achternaam: uploadedKeuring.klant.achternaam,
        //   emailadres: uploadedKeuring.klant.emailadres,
        //   telefoonnummer: uploadedKeuring.klant.telefoonnummer
        // },
        klantID: uploadedKeuring.klant_ID,
        // adres: {
        //   id: uploadedKeuring.adres.id,
        //   straatnaam: uploadedKeuring.adres.straatnaam,
        //   nummer: uploadedKeuring.adres.nummer,
        //   vlaamse_stad_ID: uploadedKeuring.adres.vlaamse_stad
        // },
        adresID: uploadedKeuring.adres_ID,
        status: uploadedKeuring.status,
        type: uploadedKeuring.type,
        toegang_eenheid: uploadedKeuring.toegang_eenheid,
        datum_toewijzing: new Date(uploadedKeuring.created_at),
        datum_plaatsbezoek: new Date(uploadedKeuring.datum_plaatsbezoek),
        created_by: uploadedKeuring.created_by,
        opmerking: uploadedKeuring.opmerking,
        facturatieID: uploadedKeuring.facturatie_ID,
        event_ID: uploadedKeuring.event_ID,
        asbest_event_ID: uploadedKeuring.asbest_event_ID
      })

      certificatenStore.empty()
      extraDocumentenStore.empty()
      router.push('/keuringen')
    }
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
    } else {
      keuringForm.facturatieID = ''
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

  const handleConfirm = () => {
    toast.add({ severity: 'error', detail: 'Keuring geannuleerd!', group: 'br', life: 5000 })
    router.push('/keuringen')
  }

  const handleClientCloseClick = () => {
    keuringForm.klantID = ''
    keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE
  }

  const handleAddressCloseClick = () => {
    keuringForm.adresID = ''
  }

  const handleCertificaatUploadClick = () => {
    certificatesFormVisible.value = !certificatesFormVisible.value
    extraDocsFormVisible.value = false
  }

  const handleExtraDocumentenUploadClick = () => {
    extraDocsFormVisible.value = !extraDocsFormVisible.value
    certificatesFormVisible.value = false
  }
</script>

<template>
  <div class="container add-keuring">
    <div class="title">
      <WEVBackButton @click="handleClick" />
      <h1>Keuring toevoegen</h1>
    </div>
    <form @submit="submitForm">
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
        <div v-if="keuringAddress" class="adres-wrapper">
          <div class="data-row">
            <div class="adres">
              {{ kAdres }}
            </div>
            <div @click="handleAddressCloseClick">
              <Icon icon="mdi:close" width="20" />
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
              <div class="email-tel">@{{ `${keuringClient.emailadres} - ${keuringClient.telefoonnummer}` }}</div>
            </div>
            <div @click="handleClientCloseClick">
              <Icon icon="mdi:close" width="20" />
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
              <div v-if="keuringForm.facturatie_bestemming !== FacturatieBestemming.HETZELFDE" @click="keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE">
                <Icon icon="mdi:close" width="20" />
              </div>
            </div>
            <div v-if="keuringForm.facturatie_bestemming === FacturatieBestemming.ANDERS" style="padding-left: 2rem">
              <div v-if="keuringFacturatie" class="fac_name">
                {{ `${keuringFacturatie.voornaam} ${keuringFacturatie.achternaam}` }}
              </div>
              <div v-if="keuringFacturatie" class="fac_email-tel">
                {{ `${keuringFacturatie.emailadres} - ${keuringFacturatie.telefoonnummer}` }}
              </div>
              <div v-if="keuringFacturatie" class="fac_adres">
                {{ `${keuringFacturatie.straatnaam} ${keuringFacturatie.nummer}, ${vlaamseStedenStore.getStadById(keuringFacturatie.vlaamse_stad_ID)?.gemeente}` }}
              </div>
            </div>
          </div>
        </div>
        <div class="opmerking">
          <div>
            <Textarea id="ta-opmerking" v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
          </div>
        </div>
        <div class="datum-plaatsbezoek-wrapper" v-if="keuringForm.type.length && keuringAddress && keuringClient">
          <h3>Datum Plaatsbezoek</h3>
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
        <div class="uploader-wrapper">
          <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="warning" @click="handleCertificaatUploadClick">
            <span class="text">
              <Icon icon="mdi:certificate" width="20" />
              Certificaten
            </span>
            <span v-if="keuringForm.type.length">
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                {{ epc_certificaten.length }}
              </span>
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)"> | </span>
              <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.ASBEST)">
                {{ asbest_certificaten.length }}
              </span>
            </span>
          </Button>
          <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="info" @click="handleExtraDocumentenUploadClick">
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
            <button type="submit" style="background-color: seagreen">
              <Icon icon="mdi:send" width="22" color="white" />
            </button>
          </li>
          <li title="Annuleren" @click="isCancelModalOpen = true">
            <button type="button" style="background-color: crimson">
              <Icon icon="mdi:close" width="22" color="white" />
            </button>
          </li>
          <WEVCancelCreationKeuring :isOpen="isCancelModalOpen" @closeWindow="isCancelModalOpen = false" @confirm="handleConfirm" />
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
          @removeDocument="(event: Event, name: string) => removeDocument(event, name)"
        />
        <WEVCertificatesForm
          v-if="certificatesFormVisible && keuringForm.klantID && keuringForm.adresID"
          :form="keuringForm"
          @uploadCertificaten="(event: Event, type: TypeKeuring, keuring: string) => uploadCertificaat(event, type, keuring)"
          @removeCertificaat="(event: Event, name: string, type: TypeKeuring) => removeCertificaat(event, name, type)"
        />
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .title {
    height: 120px;
    display: flex;
    align-items: center;
    position: relative;

    .back-btn {
      display: flex;
      margin-right: 2rem;
      border-radius: 15px;
      cursor: pointer;

      &:hover {
        background-color: #e2e8f0;
      }
    }
  }

  .add-keuring {
    font-family: 'Rubik', sans-serif;
    margin-bottom: 5rem;

    form {
      display: flex;
      align-items: flex-start;
      gap: 0.5em;
    }

    .actions {
      width: 60px;

      ul {
        flex: 1;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.5em;

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
      gap: 3em;
      flex: 1;
    }

    .keuring {
      width: 475px;
      display: flex;
      flex-direction: column;
      padding: 4.5em;
      box-shadow:
        0 0 58px 0 rgba(0, 0, 0, 0.18),
        0 0 14px 0 rgba(0, 0, 0, 0.18);
      gap: 3em;

      label,
      textarea,
      .adres,
      .name {
        font-size: 1.4em;
      }

      .adres,
      .klant,
      .name,
      .fac_name,
      .fac_adres {
        font-weight: 600;
      }

      .fac_adres {
        margin-top: 0.5em;
      }

      .email-tel {
        padding-top: 0.25em;
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
            margin-left: 1em;
          }
        }
      }

      .toegang-eenheid {
        display: flex;
        gap: 20px;

        div {
          display: flex;
          gap: 1em;
        }

        .rb-klant,
        .rb-sleutels {
          display: flex;
          align-items: center;
          accent-color: seagreen;

          label {
            // font-size: 1.4rem;
            margin-left: 1em;
          }

          input {
            margin: 0;
          }
        }
      }

      .opmerking,
      .adres-wrapper,
      .adres-error,
      .klant-error,
      .klant-wrapper,
      .facturatie-wrapper {
        display: flex;
        justify-content: space-between;
        padding-left: 1em;
      }

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
        gap: 1em;

        button {
          flex: 1;
          display: flex;
          gap: 1em;
          font-weight: bold;
          // font-size: 1m;
          font-size: 1em;

          .text {
            display: flex;
            align-items: center;
            gap: 0.5em;
            flex: 1;
          }
        }
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
          height: 100px;
        }
      }

      .facturatie-wrapper {
        flex-direction: column;
        gap: 1.5em;

        > div {
          padding-left: 0.5em;
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
              margin-left: 1em;
            }
          }
        }
      }

      .datum-plaatsbezoek-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
      }

      .data-row {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;

        div {
          display: flex;
          flex-direction: column;
        }
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
      padding: 0.75em 1.25em;
    }
  }
</style>
