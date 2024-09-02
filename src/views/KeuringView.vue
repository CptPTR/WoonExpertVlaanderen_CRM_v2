<script setup lang="ts">
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import WEVDeleteKeuring from '@/components/modals/WEVDeleteKeuring.vue'
  import { supabase } from '@/config/supabase'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Keuring } from '@/types'
  import { formatFileSize } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'
  import TabPanel from 'primevue/tabpanel'
  import TabView from 'primevue/tabview'
  import { computed, onBeforeMount, onMounted, ref } from 'vue'
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
  const klantenStore = useKlantenStore()
  const facturatiesStore = useFacturatiesStore()

  const keuring = ref<Keuring>()
  const isDeleteConfirmationOpen = ref<boolean>(false)

  onBeforeMount(() => {
    certificatenStore.empty()
    extraDocumentenStore.empty()
  })

  const editKeuring = (id: string) => {
    router.push(`/keuringen/${id}/edit`)
  }

  const handleClickGoBackButton = () => {
    router.push('/keuringen')
  }

  const getCertificatenData = async (id: string) => {
    const { data } = await supabase.from('certificaten').select('id, created_at, name, type, size, keuringID').eq('keuringID', id)

    if (data) {
      data.map((cert) => {
        certificatenStore.addCertificaat({
          created_at: cert.created_at,
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
    return null
  })

  const kClient = computed(() => {
    if (keuring.value) {
      return klantenStore.getKlant(keuring.value.klantID ?? '')
    }
    return null
  })

  const kAddress = computed(() => {
    if (keuring.value) {
      return adressenStore.getAdres(keuring.value.adresID)
    }

    return null
  })

  const kFacturatie = computed(() => {
    if (keuring.value && keuring.value.facturatieID) {
      return facturatiesStore.getFacturatie(keuring.value.facturatieID)
    }

    return null
  })

  const vlaamseStad = computed(() => {
    if (kAddress.value) {
      return vlaamseStedenStore.getStadById(kAddress.value.vlaamse_stad_ID)
    }
    return null
  })

  const facVlaamseStad = computed(() => {
    if (kFacturatie.value) {
      return vlaamseStedenStore.getStadById(kFacturatie.value.vlaamse_stad_ID)
    }
    return ''
  })

  const isLessThanOneDayOld = (createdAt: string) => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const createdAtDate = new Date(createdAt)
    return createdAtDate > twentyFourHoursAgo
  }

  onMounted(async () => {
    keuring.value = keuringenStore.getKeuring(paramId)

    if (keuring.value && keuring.value.id) {
      await getCertificatenData(keuring.value.id)
    }

    if (kAddress.value && kAddress.value.id) {
      await getExtraDocumentenData(kAddress.value.id)
    }
  })
</script>

<template>
  <div class="keuring" v-if="keuring">
    <div class="title">
      <WEVBackButton @click="handleClickGoBackButton" />
      <h1 class="text-2xl" v-if="kAddress && vlaamseStad">
        {{ `${keuring.type ?? ''} Keuring - ${kAddress.straatnaam} ${kAddress.nummer} ${kAddress.busnummer ? ' ' + kAddress.busnummer : ''}, ${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
      </h1>
      <h1 v-else>loading keuring...</h1>
    </div>
    <div class="badges">
      <div class="info">
        <span :title="`aangemaakt door ${keuring.created_by.organisatie.naam}`" class="badge created-by text-xs">
          {{ keuring.created_by.organisatie.naam }}
        </span>
        <span :title="keuring.toegang_eenheid" class="badge toegang-eenheid text-xs">
          <Icon :icon="keuring.toegang_eenheid === ToegangEenheid.KLANT ? 'mdi:handshake-outline' : 'mdi:key'" width="20" color="#fff" />
        </span>
        <span title="status" class="badge text-xs" :style="{ backgroundColor: `${getStatusColor(keuring.status)}` }">
          {{ keuring.status }}
        </span>
        <span v-if="keuring.datum_plaatsbezoek" title="datum plaatsbezoek" class="badge datum-plaatsbezoek text-sm">
          <Icon icon="mdi:calendar-check" width="20" />
          {{ formattedDateTime }}
        </span>
      </div>
      <div class="actions" v-if="keuring.id">
        <span title="wijzig keuring" @click="editKeuring(keuring.id)" class="badge">
          <Icon icon="mdi:edit" width="20" color="#000" />
        </span>
        <span title="verwijder keuring" @click="isDeleteConfirmationOpen = true" class="badge">
          <Icon icon="mdi:delete" width="20" color="#000" />
        </span>
        <WEVDeleteKeuring :keuring="keuring" :isOpen="isDeleteConfirmationOpen" @cancel-delete-keuring="isDeleteConfirmationOpen = false" />
      </div>
    </div>
    <div class="content">
      <div class="klant-fac" v-if="kClient && kAddress">
        <div class="klant">
          <h2 class="text-lg">Klant</h2>
          <span class="text-sm">
            <Icon icon="mdi:account" width="20" />
            {{ `${kClient.voornaam} ${kClient.achternaam}` }}
          </span>
          <span class="text-sm">
            <Icon icon="mdi:at" width="20" />
            {{ kClient.emailadres }}
          </span>
          <span class="text-sm">
            <Icon icon="mdi:phone" width="20" />
            {{ kClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
          </span>
        </div>
        <div class="fac" v-if="keuring.facturatie_bestemming === FacturatieBestemming.IMMO">
          <h2 class="text-lg">Facturatie</h2>
          <span class="text-sm">
            <Icon icon="mdi:arrow-right" width="16" />
            IMMO
          </span>
        </div>
        <div class="fac" v-if="kFacturatie && facVlaamseStad && vlaamseStad">
          <h2 class="text-lg">Facturatie</h2>
          <span class="text-sm" v-if="!`${kFacturatie.voornaam} ${kFacturatie.achternaam}`.includes(`${kClient.voornaam} ${kClient.achternaam}`)">
            <Icon icon="mdi:account" width="20" />
            {{ `${kFacturatie.voornaam} ${kFacturatie.achternaam}` }}
          </span>
          <span class="text-sm" v-if="!kFacturatie.emailadres.includes(kClient.emailadres)">
            <Icon icon="mdi:at" width="20" />
            {{ kFacturatie.emailadres }}
          </span>
          <span class="text-sm" v-if="!kFacturatie.telefoonnummer.includes(kClient.telefoonnummer)">
            <Icon icon="mdi:phone" width="20" />
            {{ kFacturatie.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
          </span>
          <span class="text-sm" v-if="!`${kFacturatie.straatnaam} ${kFacturatie.nummer}`.includes(`${kAddress.straatnaam} ${kAddress.nummer}`)">
            <Icon icon="mdi:home" width="20" />
            {{ `${kFacturatie.straatnaam} ${kFacturatie.nummer}${kFacturatie.busnummer ? ' ' + kFacturatie.busnummer : ''}` }}
          </span>
          <span class="text-sm" v-if="!`${facVlaamseStad.postcode} ${facVlaamseStad.gemeente}`.includes(`${vlaamseStad.postcode} ${vlaamseStad.gemeente}`)">
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
              <span class="font-bold white-space-nowrap text-sm">
                Certificaten
                <span>({{ certificatenStore.certificaten.length }})</span>
              </span>
            </div>
          </template>
          <div class="certificaten-wrapper">
            <ul class="certificaten" v-if="certificatenStore.certificaten.length > 0">
              <li v-for="certificaat in certificatenStore.certificaten" :key="certificaat.id">
                <span class="type text-sm">
                  {{ certificaat.type }}
                </span>
                |
                <div>
                  <span class="naam text-sm">
                    {{ certificaat.naam }}
                    <p v-if="isLessThanOneDayOld(certificaat.created_at)" class="recent">Recent geüpload</p>
                  </span>
                  <span class="size text-xs"> ({{ formatFileSize(certificaat.size) }}) </span>
                </div>
                <span @click="handleCertificaatDownload(certificaat.type, certificaat.naam)">
                  <Icon class="download" icon="mdi:download" width="20" />
                </span>
              </li>
            </ul>
            <div class="text-sm" v-else>Geen certificaten beschikbaar</div>
          </div>
        </TabPanel>
        <TabPanel>
          <template #header>
            <div class="tab-header">
              <Icon icon="mdi:file-document-multiple" width="18" />
              <span class="font-bold white-space-nowrap text-sm">
                Extra Documenten
                <span>({{ extraDocumentenStore.extra_documenten.length }})</span>
              </span>
            </div>
          </template>
          <div class="extra-docs-wrapper">
            <ul class="extra-docs" v-if="extraDocumentenStore.extra_documenten.length > 0">
              <li v-for="extraDoc in extraDocumentenStore.extra_documenten" :key="extraDoc.id">
                <div>
                  <span class="naam text-sm">
                    {{ extraDoc.naam }}
                  </span>
                  <span class="size text-xs"> ({{ formatFileSize(extraDoc.size) }}) </span>
                </div>
                <span @click="handleExtraDocumentDownload(extraDoc.naam)">
                  <Icon class="download" icon="mdi:download" width="20" />
                </span>
              </li>
            </ul>
            <div class="text-sm" v-else>Geen extra documenten beschikbaar</div>
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

  .meta-badge {
    display: flex;
    background-color: mediumseagreen;
    position: absolute;
    top: -12px;
    left: 8px;
    padding: 0.1rem 0.3rem;
    margin: 0;
    border-radius: 5px;
  }

  .badges {
    display: flex;
    align-items: center;
    justify-content: space-between;

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

      .toegewezen-aan {
        position: relative;
        background-color: seagreen;
      }

      .toegang-eenheid {
        background-color: #000;
      }
    }

    .actions {
      display: flex;
      gap: 5px;

      span {
        background-color: rgb(245, 245, 245);
      }
    }

    .badge {
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
    margin-top: 1rem;
    position: relative;
    padding: 3rem 4rem;
    box-shadow:
      0 26px 58px 0 rgba(0, 0, 0, 0.22),
      0 5px 14px 0 rgba(0, 0, 0, 0.18);

    .klant-fac {
      display: flex;
      flex-direction: column;
      gap: 2rem;

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
        line-height: 1rem;
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
          display: flex;
        }

        .type {
          width: 50px;
        }

        .naam {
          position: relative;
          font-weight: bold;
          flex: 1;

          .recent {
            position: absolute;
            top: 5px;
            color: green;
            font-size: 0.7rem;
          }
        }

        .download {
          cursor: pointer;
          color: seagreen;
        }
      }
    }

    .p-component {
      flex: 1;
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
