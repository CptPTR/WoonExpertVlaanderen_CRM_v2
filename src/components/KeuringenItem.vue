<script setup lang="ts">
  import { Status } from '@/enums/modules/Status'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import { getStatusColor } from '@/utils/colors'
  import { formatDate } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'
  import { vOnClickOutside } from '@vueuse/components'
  import { computed, ref } from 'vue'
  import type { Keuring } from '../types'
  import WEVDeleteKeuring from './modals/WEVDeleteKeuring.vue'

  const emit = defineEmits(['view-keuring', 'edit-keuring', 'delete-keuring'])

  const { keuring } = defineProps<{
    keuring: Keuring
  }>()

  const vlaamseStedenStore = useVlaamseStedenStore()
  const klantenStore = useKlantenStore()
  const adressenStore = useAdressenStore()

  const isDeleteConfirmationOpen = ref(false)
  const isActionsMenuOpen = ref<boolean>(false)

  const toggleActionsMenu = () => {
    isActionsMenuOpen.value = !isActionsMenuOpen.value
  }

  const closeActionsMenu = () => {
    isActionsMenuOpen.value = false
  }

  const viewKeuring = () => {
    emit('view-keuring', keuring.id)
  }

  const editKeuring = () => {
    emit('edit-keuring', keuring.id)
  }

  const handleDeleteKeuring = () => {
    isDeleteConfirmationOpen.value = true
    isActionsMenuOpen.value = false
  }

  const formattedDateTime = computed(() => {
    return keuring.datum_toewijzing.toLocaleString('nl-BE', {
      timeZone: 'Europe/Brussels',
      day: 'numeric',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  })

  const statusText = computed(() => {
    if (keuring.status === Status.INGEPLAND && keuring.datum_plaatsbezoek) {
      return `${keuring.status} op ${formatDate(new Date(keuring.datum_plaatsbezoek))}`
    } else {
      return keuring.status
    }
  })

  const vlaamseStad = computed(() => {
    return vlaamseStedenStore.getStadById(kAddress.value.vlaamse_stad_ID)
  })

  const kClient = computed(() => {
    return klantenStore.getKlant(keuring.klantID ?? '')
  })

  const kAddress = computed(() => {
    return adressenStore.getAdres(keuring.adresID ?? '')
  })
</script>

<template>
  <td v-if="keuring.datum_toewijzing">
    {{ formattedDateTime }}
  </td>
  <td>
    {{ keuring.created_by.organisatie.naam }}
  </td>
  <td v-if="keuring.type">
    {{ keuring.type.toUpperCase() }}
  </td>
  <td class="klant" v-if="keuring.klantID">
    <span class="naam">
      {{ kClient.voornaam + ' ' + kClient.achternaam }}
    </span>
    <br />
    <span class="emailadres">
      {{ kClient.emailadres }}
    </span>
  </td>
  <td class="adres" v-if="keuring.adresID">
    <span class="straatnaam-nummer">
      <!-- {{ keuring.adresID + ' ' + keuring.adresID }} -->
      {{ kAddress.straatnaam + ' ' + kAddress.nummer }}
    </span>
    <br />
    <span class="gemeente" v-if="vlaamseStad">
      {{ `${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
    </span>
  </td>
  <td>
    <div class="status" :style="{ backgroundColor: getStatusColor(keuring.status) }">
      {{ statusText }}
    </div>
  </td>
  <td class="actions">
    <span title="keuring bekijken" @click="toggleActionsMenu">
      <Icon icon="mdi:dots-vertical" color="grey" width="24" />
    </span>
    <div v-if="isActionsMenuOpen" class="menu" v-on-click-outside="closeActionsMenu">
      <ul>
        <li @click="viewKeuring">
          <Icon icon="mdi:file-search" width="14" />
          Bekijken
        </li>
        <li @click="editKeuring">
          <Icon icon="mdi:pencil" width="14" />
          Aanpassen
        </li>
        <li @click="handleDeleteKeuring">
          <Icon icon="mdi:delete" width="14" />
          Verwijderen
        </li>
      </ul>
    </div>
    <WEVDeleteKeuring :keuring="keuring" :isOpen="isDeleteConfirmationOpen" @cancel-delete-keuring="isDeleteConfirmationOpen = false" />
  </td>
</template>

<style lang="scss" scoped>
  td {
    padding: 15px 20px;
  }

  .naam,
  .straatnaam-nummer {
    font-weight: bold;
  }

  .emailadres,
  .gemeente {
    font-size: 1.1rem;
  }

  .actions {
    position: relative;
    gap: 2px;
    text-align: right;

    span {
      display: inline-block;
      margin-left: 5px;
      cursor: pointer;
    }

    .menu {
      position: absolute;
      right: 20px;
      z-index: 5;
      border: 1px solid lightgray;
    }

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;

      li {
        display: flex;
        align-items: center;
        gap: 1em;
        padding: 1em;
        font-size: 1em;
        background-color: #fff;
        cursor: pointer;

        &:hover {
          background-color: seagreen;
          color: #fff;
        }
      }
    }
  }

  .status {
    width: fit-content;
    padding: 1em 1.5em;
    border-radius: 45px;
    color: #fff;
  }
</style>
