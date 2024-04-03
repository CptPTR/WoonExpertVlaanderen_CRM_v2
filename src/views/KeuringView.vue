<script setup lang="ts">
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import WEVDeleteKeuring from '@/components/modals/WEVDeleteKeuring.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { KeuringData } from '@/types'
  import { formatFileSize } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'
  import Badge from 'primevue/badge'
  import TabPanel from 'primevue/tabpanel'
  import TabView from 'primevue/tabview'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getStatusColor } from './../utils/colors'

  const route = useRoute()
  const router = useRouter()
  const paramId = route.params.id as string

  const keuringenStore = useKeuringenStore()
  const extraDocumentenStore = useExtraDocumentStore()
  const certificatenStore = useCertificaatStore()
  const adressenStore = useAdressenStore()
  const vlaamseStedenStore = useVlaamseStedenStore()

  const keuring = ref<KeuringData>()
  const isDeleteConfirmationOpen = ref<boolean>(false)

  const editKeuring = (id: string) => {
    certificatenStore.empty()
    extraDocumentenStore.empty()
    router.push(`/keuringen/${id}/edit`)
  }

  const handleClickGoBackButton = () => {
    certificatenStore.empty()
    extraDocumentenStore.empty()
    router.push('/keuringen')
  }

  const getCertificatenData = async (id: string) => {
    const { data } = await supabase.from('certificaten').select('id, created_at, name, type, size, keuringID').eq('keuringID', id)

    if (data) {
      data.map((cert) => {
        certificatenStore.addCertificaat({
          naam: cert.name,
          size: cert.size,
          type: cert.type,
          keuringID: cert.keuringID
        })
      })
    }
  }

  const getExtraDocumentenData = async (id: string) => {
    const { data } = await supabase.from('extra_documenten').select('id, created_at, naam, type, size, adres_ID').eq('adres_ID', id)

    if (data) {
      data.map((document) => {
        extraDocumentenStore.addExtraDocument({
          naam: document.naam,
          size: document.size,
          type: document.type,
          adresID: document.adres_ID
        })
      })
    }
  }

  const handleCertificaatDownload = async (certType: string, certNaam: string) => {
    const { data, error } = await supabase.storage.from('certificaten').download(`${certType}/${certNaam}`)

    if (error) {
      console.error(`Could not download ${certNaam} from the storage`)
      return
    }

    const blobUrl: string = URL.createObjectURL(data)

    const downloadLink: HTMLAnchorElement = document.createElement('a')
    downloadLink.href = blobUrl
    downloadLink.download = `${certNaam}`

    document.body.appendChild(downloadLink)

    downloadLink.click()

    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(blobUrl)
  }

  const handleExtraDocumentDownload = async (naam: string) => {
    const { data, error } = await supabase.storage.from('extra-documenten').download(`${naam}`)

    if (error) {
      console.error(`Could not download ${naam} from the storage`)
      return
    }

    const blobUrl: string = URL.createObjectURL(data)
    const downloadLink: HTMLAnchorElement = document.createElement('a')
    downloadLink.href = blobUrl
    downloadLink.download = `${naam}`

    document.body.appendChild(downloadLink)

    downloadLink.click()

    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(blobUrl)
  }

  const formattedDateTime = computed(() => {
    if (keuring.value && keuring.value.datum_plaatsbezoek) {
      return keuring.value.datum_plaatsbezoek.toLocaleString('nl-BE', {
        timeZone: 'Europe/Brussels',
        day: 'numeric',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return ''
  })

  const adres = computed(() => {
    if (keuring.value && keuring.value.adres) {
      return adressenStore.getAdres(keuring.value.adres.id)
    }
    return ''
  })

  const vlaamseStad = computed(() => {
    if (keuring.value && keuring.value.adres) {
      return vlaamseStedenStore.getStadById(keuring.value.adres.vlaamse_stad_ID)
    }
    return ''
  })

  const facVlaamseStad = computed(() => {
    if (keuring.value && keuring.value.facturatie) {
      return vlaamseStedenStore.getStadById(keuring.value.facturatie.vlaamse_stad_ID)
    }
    return ''
  })

  onMounted(async () => {
    keuring.value = keuringenStore.getKeuring(paramId)

    if (keuring.value && keuring.value.id) {
      await getCertificatenData(keuring.value.id)
    }

    if (keuring.value && keuring.value.adres.id) {
      await getExtraDocumentenData(keuring.value.adres.id)
    }
  })
</script>

<template>
  <div class="container keuring" v-if="keuring">
    <div class="title">
      <WEVBackButton @click="handleClickGoBackButton" />
      <h1 v-if="adres && vlaamseStad">
        {{ `${keuring.type ?? ''} Keuring - ${adres.straatnaam} ${adres.nummer}, ${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
      </h1>
      <h1 v-else>loading keuring...</h1>
    </div>
    <div class="badges">
      <div class="info">
        <span :title="`aangemaakt door ${keuring.created_by.organisatie.naam}`" class="created-by">
          {{ keuring.created_by.organisatie.naam }}
        </span>
        <span :title="keuring.toegang_eenheid" class="toegang-eenheid">
          <Icon :icon="keuring.toegang_eenheid === ToegangEenheid.KLANT ? 'mdi:handshake-outline' : 'mdi:key'" width="20" color="#fff" />
        </span>
        <span title="status" :style="{ backgroundColor: `${getStatusColor(keuring.status)}` }">
          {{ keuring.status }}
        </span>
        <span v-if="keuring.datum_plaatsbezoek" title="datum plaatsbezoek" class="datum-plaatsbezoek">
          <Icon icon="mdi:calendar-check" width="20" />
          {{ formattedDateTime }}
        </span>
      </div>
      <div class="actions" v-if="keuring.id">
        <span title="wijzig keuring" @click="editKeuring(keuring.id)">
          <Icon icon="mdi:edit" width="20" color="#000" />
        </span>
        <span title="verwijder keuring" @click="isDeleteConfirmationOpen = true">
          <Icon icon="mdi:delete" width="20" color="#000" />
        </span>
        <WEVDeleteKeuring :keuring="keuring" :isOpen="isDeleteConfirmationOpen" @cancel-delete-keuring="isDeleteConfirmationOpen = false" />
      </div>
    </div>
    <div class="content">
      <div class="klant-fac">
        <div class="klant">
          <h2>Klant</h2>
          <span>
            <Icon icon="mdi:account" width="20" />
            {{ `${keuring.klant.voornaam} ${keuring.klant.achternaam}` }}
          </span>
          <span>
            <Icon icon="mdi:at" width="20" />
            {{ keuring.klant.emailadres }}
          </span>
          <span>
            <Icon icon="mdi:phone" width="20" />
            {{ keuring.klant.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
          </span>
        </div>
        <div class="fac" v-if="keuring.facturatie_bestemming === FacturatieBestemming.IMMO">
          <h2>Facturatie</h2>
          <span>
            <Icon icon="mdi:arrow-right" width="16" />
            IMMO
          </span>
        </div>
        <div class="fac" v-if="keuring.facturatie && facVlaamseStad && vlaamseStad">
          <h2>Facturatie</h2>
          <span v-if="!`${keuring.facturatie.voornaam} ${keuring.facturatie.voornaam}`.includes(`${keuring.klant.voornaam} ${keuring.klant.achternaam}`)">
            <Icon icon="mdi:account" width="20" />
            {{ `${keuring.facturatie.voornaam} ${keuring.facturatie.achternaam}` }}
          </span>
          <span v-if="!keuring.facturatie.emailadres.includes(keuring.klant.emailadres)">
            <Icon icon="mdi:at" width="20" />
            {{ keuring.facturatie.emailadres }}
          </span>
          <span v-if="!keuring.facturatie.telefoonnummer.includes(keuring.klant.telefoonnummer)">
            <Icon icon="mdi:phone" width="20" />
            {{ keuring.facturatie.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
          </span>
          <span v-if="!`${keuring.facturatie.straatnaam} ${keuring.facturatie.nummer}`.includes(`${keuring.adres.straatnaam} ${keuring.adres.nummer}`)">
            <Icon icon="mdi:home" width="20" />
            {{ `${keuring.facturatie.straatnaam} ${keuring.facturatie.nummer}` }}
          </span>
          <span v-if="!`${facVlaamseStad.postcode} ${facVlaamseStad.gemeente}`.includes(`${vlaamseStad.postcode} ${vlaamseStad.gemeente}`)">
            <Icon icon="mdi:city" width="20" />
            {{ `${facVlaamseStad.postcode} ${facVlaamseStad.gemeente}` }}
          </span>
        </div>
      </div>
      <TabView>
        <TabPanel>
          <template #header>
            <div class="tab-header">
              <Icon icon="mdi:certificate" width="18" />
              <span class="font-bold white-space-nowrap">Certificaten</span>
              <Badge :value="certificatenStore.certificaten.length" severity="warning" />
            </div>
          </template>
          <div class="certificaten-wrapper">
            <ul class="certificaten" v-if="certificatenStore.certificaten.length > 0">
              <li v-for="certificaat in certificatenStore.certificaten" :key="certificaat.id">
                <span class="type">
                  {{ certificaat.type }}
                </span>
                |
                <div>
                  <span class="naam">
                    {{ certificaat.naam }}
                  </span>
                  <span class="size"> ({{ formatFileSize(certificaat.size) }}) </span>
                </div>
                <span @click="handleCertificaatDownload(certificaat.type, certificaat.naam)">
                  <Icon class="download" icon="mdi:download" width="20" />
                </span>
              </li>
            </ul>
            <div v-else>Geen certificaten beschikbaar</div>
          </div>
        </TabPanel>
        <TabPanel>
          <template #header>
            <div class="tab-header">
              <Icon icon="mdi:file-document-multiple" width="18" />
              <span class="font-bold white-space-nowrap">Extra Documenten</span>
              <Badge :value="extraDocumentenStore.extra_documenten.length" severity="info" />
            </div>
          </template>
          <div class="extra-docs-wrapper">
            <ul class="extra-docs" v-if="extraDocumentenStore.extra_documenten.length > 0">
              <li v-for="extraDoc in extraDocumentenStore.extra_documenten" :key="extraDoc.id">
                <div>
                  <span class="naam">
                    {{ extraDoc.naam }}
                  </span>
                  <span class="size"> ({{ formatFileSize(extraDoc.size) }}) </span>
                </div>
                <span @click="handleExtraDocumentDownload(extraDoc.naam)">
                  <Icon class="download" icon="mdi:download" width="20" />
                </span>
              </li>
            </ul>
            <div v-else>Geen extra documenten beschikbaar</div>
          </div>
        </TabPanel>
        <TabPanel v-if="keuring.opmerking">
          <template #header>
            <div class="tab-header">
              <Icon icon="mdi:comment" width="18" />
              <span class="font-bold white-space-nowrap">Opmerking</span>
            </div>
          </template>
          <div class="opmerking-wrapper">
            {{ keuring.opmerking }}
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .keuring {
    font-family: 'Rubik', sans-serif;
  }

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

  .badges {
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      font-size: 1.4rem;
    }

    .info {
      display: flex;
      gap: 5px;

      .datum-plaatsbezoek {
        display: flex;
        gap: 0.5rem;
        color: #000;
      }

      .created-by {
        background-color: darkcyan;
      }

      .toegang-eenheid {
        background-color: #000;
      }
    }

    .actions {
      display: flex;
      gap: 5px;

      span {
        background-color: #e2e8f0;
      }
    }

    span {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      color: #fff;
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
    }
  }

  .content {
    display: flex;
    gap: 9rem;
    margin-top: 10px;
    position: relative;
    padding: 4.5rem;
    box-shadow:
      0 26px 58px 0 rgba(0, 0, 0, 0.22),
      0 5px 14px 0 rgba(0, 0, 0, 0.18);

    .klant-fac {
      display: flex;
      flex-direction: column;
      gap: 5rem;

      .klant,
      .fac {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      span {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 1.4rem;
      }
    }

    .certificaten-wrapper,
    .extra-docs-wrapper,
    .opmerking-wrapper {
      padding-block: 2rem;
    }

    .certificaten,
    .extra-docs {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      li {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 1rem;

        div {
          flex: 1;
        }

        .type {
          width: 50px;
        }

        .naam {
          font-weight: bold;
        }

        .size {
          font-size: 1rem;
        }

        .download {
          cursor: pointer;
          color: seagreen;
        }
      }
    }

    .p-component {
      flex: 1;
      font-size: 1.4rem;
    }

    .p-badge {
      font-size: 1rem;
    }

    .tab-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
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
      width: 450px;
      gap: 20px;
      align-items: flex-start;
      border-radius: 5px;
      background-color: #fff;
      padding: 3rem;

      h2 {
        font-size: 2rem;
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
          font-size: 1.3rem;
          line-height: 1.6rem;
        }
      }

      .actions {
        align-self: flex-end;
        display: flex;
        gap: 7px;

        * {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1.4rem;
        }

        .cancel {
          background-color: grey;
          color: #fff;
          font-family: 'Rubik', sans-serif;
        }

        .delete {
          background-color: #dc3545;
          color: #fff;
          font-family: 'Rubik', sans-serif;
        }
      }
    }
  }
</style>
