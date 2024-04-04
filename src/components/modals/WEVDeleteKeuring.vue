<script setup lang="ts">
  import { supabase } from '@/config/supabase'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Keuring } from '@/types'
  import { Icon } from '@iconify/vue'
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

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

  // const vlaamseStad = computed(() => {
  //   return vlaamseStedenStore.getStadById(keuring.adres.vlaamse_stad_ID)
  // })

  const kAddress = computed(() => {
    // return `${keuring.adres.straatnaam} ${keuring.adres.nummer}, ${vlaamseStad.value.postcode} ${vlaamseStad.value.gemeente}`
    return adressenStore.getAdres(keuring.adresID)
  })

  const kClient = computed(() => {
    return klantenStore.getKlant(keuring.klantID)
  })

  const formattedDateTime = computed(() => {
    if (keuring && keuring.datum_plaatsbezoek) {
      return keuring.datum_plaatsbezoek.toLocaleString('nl-BE', {
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

  const handleCancelClick = () => {
    emit('cancel-delete-keuring')
  }

  const deleteKeuring = async (id: string) => {
    const { error } = await supabase.from('keuringen').delete().eq('id', id)

    if (error) {
      console.error(`Could not delete keuring with id ${id} from the database.`)
    } else {
      keuringenStore.removeKeuring(id)
      router.replace({ path: '/keuringen' })
    }
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal">
      <div class="content">
        <h2>Bent u zeker dat u deze keuring wilt verwijderen?</h2>
        <p>{{ keuring }}</p>
        <ul v-if="keuring">
          <li>
            {{ keuring.type.toUpperCase() }}
          </li>
          <li>
            {{ keuring.status }}
          </li>
          <li v-if="keuring.datum_plaatsbezoek">
            <Icon icon="mdi:clock" />
            {{ formattedDateTime }}
          </li>
          <li v-else>
            <Icon icon="mdi:clock" />
            Datum plaatsbezoek (nog) niet ingepland
          </li>
          <li>
            <Icon icon="mdi:home" />
            {{ `${kAddress.straatnaam} ${kAddress.nummer}, ` }}
          </li>
          <li>
            <Icon icon="mdi:account" />
            {{ `${kClient.voornaam} ${kClient.achternaam}` }}
          </li>
          <li>
            <Icon icon="mdi:phone" />
            {{ `${kClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` }}
          </li>
          <li>
            <Icon icon="mdi:email" />
            {{ `${kClient.emailadres}` }}
          </li>
        </ul>
        <div class="actions">
          <button class="cancel" title="Annuleer" @click="handleCancelClick">Annuleer</button>
          <button class="delete" title="Verwijder keuring" @click="deleteKeuring(keuring.id ? keuring.id : (route.params.id as string))">Verwijder keuring</button>
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
