<script setup lang="ts">
  import { supabase } from '@/config/supabase'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useDeskundigenStore } from '@/stores/deskundigenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Keuring } from '@/types'
  import { Icon } from '@iconify/vue'
  import axios from 'axios'
  import Button from 'primevue/button'
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { formatDate } from '@/utils/formatting'

  const emit = defineEmits(['cancel-delete-keuring'])

  const { keuring } = defineProps<{
    keuring: Keuring
    isOpen: boolean
  }>()

  const router = useRouter()
  const route = useRoute()
  const keuringenStore = useKeuringenStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const adressenStore = useAdressenStore()
  const klantenStore = useKlantenStore()
  const deskundigeStore = useDeskundigenStore()

  const vlaamseStad = computed(() => {
    return vlaamseStedenStore.getStadById(kAddress.value.vlaamse_stad_ID)
  })

  const kAddress = computed(() => {
    return adressenStore.getAdres(keuring.adresID)
  })

  const kClient = computed(() => {
    return klantenStore.getKlant(keuring.klantID)
  })

  const formattedDateTime = computed(() => {
    if (keuring && keuring.datum_plaatsbezoek) {
      return formatDate(keuring.datum_plaatsbezoek)
    }
    return null
  })

  const handleCancelClick = () => {
    emit('cancel-delete-keuring')
  }

  const deleteKeuring = async (id: string) => {
    const { error } = await supabase.from('keuringen').delete().eq('id', id)

    const keuringToDelete = keuringenStore.getKeuring(id)

    if (error) {
      console.error(`Could not delete keuring with id ${id} from the database.`)
    } else {
      if (keuringToDelete) {
        if (keuringToDelete.admin_event_ID) {
          const wevAdmin = deskundigeStore.deskundigen.find((deskundige) => deskundige.gebruikersnaam === process.env.WEV_ADMIN)!
          await axios.delete(`${process.env.BACKEND_BASE_URL}/calendars/${wevAdmin.gebruikersnaam}/events/${keuringToDelete.admin_event_ID}`)
        }

        if (keuringToDelete.event_ID && keuringToDelete.epc_toegewezen_aan) {
          const epcDeskundige = deskundigeStore.deskundigen.find((deskundige) => keuringToDelete.epc_toegewezen_aan === deskundige.id)!
          await axios.delete(`${process.env.BACKEND_BASE_URL}/calendars/${epcDeskundige.gebruikersnaam}/events/${keuringToDelete.event_ID}`)
        }

        if (keuringToDelete.asbest_event_ID && keuringToDelete.asbest_toegewezen_aan && keuringToDelete.asbest_toegewezen_aan !== keuringToDelete.epc_toegewezen_aan) {
          const asbestDeskundige = deskundigeStore.deskundigen.find((deskundige) => keuringToDelete.asbest_toegewezen_aan === deskundige.id)!
          await axios.delete(`${process.env.BACKEND_BASE_URL}/calendars/${asbestDeskundige.gebruikersnaam}/events/${keuringToDelete.asbest_event_ID}`)
        }
      }

      keuringenStore.removeKeuring(id)
      router.replace({ path: '/keuringen' })
    }
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal">
      <div class="content">
        <h2 class="text-2xl">Bent u zeker dat u deze keuring wilt verwijderen?</h2>
        <ul v-if="keuring">
          <li class="text-sm">
            <Icon icon="mdi:certificate" />

            {{ keuring.type.toUpperCase() }}
          </li>
          <li class="text-sm">
            <Icon icon="mdi:label" />
            {{ keuring.status }}
          </li>
          <li class="text-sm" v-if="keuring.datum_plaatsbezoek">
            <Icon icon="mdi:clock" />
            {{ formattedDateTime }}
          </li>
          <li class="text-sm" v-else>
            <Icon icon="mdi:clock" />
            Datum plaatsbezoek (nog) niet ingepland
          </li>
          <li class="text-sm">
            <Icon icon="mdi:home" />
            {{ `${kAddress.straatnaam} ${kAddress.nummer} ${kAddress.busnummer ? ' ' + kAddress.busnummer : ''}, ${vlaamseStad.postcode} ${vlaamseStad.gemeente}` }}
          </li>
          <li class="text-sm">
            <Icon icon="mdi:account" />
            {{ `${kClient.voornaam} ${kClient.achternaam}` }}
          </li>
          <li class="text-sm">
            <Icon icon="mdi:phone" />
            {{ `${kClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` }}
          </li>
          <li class="text-sm">
            <Icon icon="mdi:email" />
            {{ `${kClient.emailadres}` }}
          </li>
        </ul>
        <div class="actions">
          <Button class="text-sm" raised severity="contrast" @click="handleCancelClick">Annuleer</Button>
          <Button class="text-sm" raised severity="danger" @click="deleteKeuring(keuring.id ? keuring.id : (route.params.id as string))">Verwijder keuring</Button>
        </div>
      </div>
    </div>

    <template v-else />
  </Teleport>
</template>

<style lang="scss" scoped>
  span {
    background-color: #e2e8f0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
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
  }

  .content {
    display: flex;
    flex-direction: column;
    width: 450px;
    gap: 20px;
    align-items: flex-start;
    border-radius: 5px;
    background-color: #fff;
    padding: 3rem;

    ul {
      margin-block: 1rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-left: 1rem;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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
</style>
