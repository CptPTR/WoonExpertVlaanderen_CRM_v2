<script setup lang="ts">
  import KeuringenItem from '@/components/KeuringenItem.vue'
  import { supabase } from '@/config/supabase'
  import { Status } from '@/enums/modules/Status'
  import router from '@/router'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import { useKlantenStore } from '@/stores/klantenStore'
  import type { Keuring } from '@/types'
  import { Icon } from '@iconify/vue'
  import Image from 'primevue/image'
  import { computed, ref } from 'vue'

  const keuringenStore = useKeuringenStore()
  const klantenStore = useKlantenStore()
  const adressenStore = useAdressenStore()

  const filterOp = ref<string>('')
  const currentPage = ref<number>(1)
  const MAX_ROWS = 8

  const finalKeuringen = computed(() => {
    return filterKeuringen().sort(sortKeuringen)
  })

  const filterKeuringen = () => {
    return keuringenStore.keuringen.filter((keuring) => {
      const klant = klantenStore.getKlant(keuring.klantID)
      const adres = adressenStore.getAdres(keuring.adresID)
      const klantAdres = `${klant.voornaam} ${klant.achternaam} ${adres.straatnaam}`.toLowerCase()
      return klantAdres.includes(filterOp.value.toLowerCase())
    })
  }

  const sortKeuringen = (keuringA: Keuring, keuringB: Keuring) => {
    const statusOrder = {
      [Status.NIEUW]: 1,
      [Status.INGEPLAND]: 2,
      [Status.IN_BEHANDELING]: 3,
      [Status.CERTIFICAAT_BESCHIKBAAR]: 4
    }

    const getStatusOrder = (status: Status) => statusOrder[status] || 0

    const compareStatus = getStatusOrder(keuringA.status) - getStatusOrder(keuringB.status)

    if (compareStatus !== 0) {
      return compareStatus
    }

    const dateComparator = (dateA: Date, dateB: Date) => {
      const timestampA = dateA.getTime()
      const timestampB = dateB.getTime()

      return timestampA - timestampB
    }

    if (keuringA.status === Status.INGEPLAND || keuringA.status === Status.IN_BEHANDELING) {
      if (keuringA.datum_plaatsbezoek && keuringB.datum_plaatsbezoek) {
        return dateComparator(keuringA.datum_plaatsbezoek, keuringB.datum_plaatsbezoek)
      }
    }

    if (keuringA.status === Status.NIEUW || keuringA.status === Status.CERTIFICAAT_BESCHIKBAAR) {
      return -dateComparator(new Date(keuringA.datum_toewijzing), new Date(keuringB.datum_toewijzing))
    }

    return 0
  }

  const totalPages = computed(() => {
    return Math.ceil(finalKeuringen.value.length / MAX_ROWS)
  })

  const zoekKeuringen = (event: Event) => {
    currentPage.value = 1
    filterOp.value = (event.target as HTMLInputElement).value
  }

  const viewKeuring = (id: string) => {
    router.push(`/keuringen/${id}`)
  }

  const addKeuring = () => {
    router.push('/keuringen/add')
  }

  const editKeuring = (id: string) => {
    router.push(`/keuringen/${id}/edit`)
  }

  const deleteKeuring = async (id: string) => {
    const { error } = await supabase.from('keuringen').delete().eq('id', id)

    if (error) {
      console.error(`Could not delete keuring with id ${id} from the database.`)
    } else {
      keuringenStore.removeKeuring(id)
    }
  }

  const goBack = () => {
    currentPage.value--
  }

  const goNext = () => {
    currentPage.value++
  }

  const goToPage = (index: number) => {
    currentPage.value = index
  }
</script>

<template>
  <div class="container keuringen">
    <div class="title">
      <h1 class="text-2xl">Keuringen</h1>
    </div>
    <div class="table-wrapper">
      <div class="table-actions">
        <button class="add-keuring-button" @click="addKeuring">
          <Icon icon="mdi:plus" width="20" />
        </button>
        <div class="searchbar">
          <Icon icon="mdi:magnify" width="24" color="lightgrey" class="icon" />
          <input id="zoekKeuringen" name="zoekKeuringen" type="text" placeholder="Zoek klant/adres..." @input="zoekKeuringen" />
        </div>
      </div>
      <div v-if="keuringenStore.keuringen.length !== 0">
        <table>
          <tr>
            <th class="text-sm">datum <br />toewijzing</th>
            <th class="text-sm">type</th>
            <th class="text-sm">klant</th>
            <th class="text-sm">adres</th>
            <th class="text-sm">aangemaakt door</th>
            <th class="text-sm">status</th>
            <th></th>
          </tr>
          <tr v-for="keuring in finalKeuringen.slice(MAX_ROWS * currentPage - MAX_ROWS, MAX_ROWS * currentPage)" :key="keuring.id" @dblclick="viewKeuring(keuring.id)">
            <KeuringenItem :keuring="keuring" @view-keuring="viewKeuring" @edit-keuring="editKeuring" @delete-keuring="deleteKeuring" />
          </tr>
        </table>
      </div>
      <div v-else>
        <div class="geen-keuringen-gevonden">
          <Image src="/keuring_niet_gevonden.png" alt="geen keuringen gevonden" width="500" />
          <p>Helaas, geen keuringen gevonden!</p>
        </div>
      </div>
      <div class="pagination-wrapper">
        <div class="pagination" v-if="keuringenStore.keuringen.length > 0">
          <button class="previous" @click="goBack" :disabled="currentPage === 1">
            <Icon icon="ic:twotone-less-than" color="#000" width="15" />
          </button>
          <div class="gap" v-if="totalPages > 8">
            <button v-if="currentPage !== 1" @click="goToPage(1)">1</button>

            <button v-if="currentPage > 4">...</button>

            <button v-if="currentPage > 3" @click="goToPage(currentPage - 2)">{{ currentPage - 2 }}</button>
            <button v-if="currentPage > 2" @click="goToPage(currentPage - 1)">{{ currentPage - 1 }}</button>

            <button :style="{ backgroundColor: 'seagreen', color: '#fff' }">{{ currentPage }}</button>

            <button v-if="currentPage < totalPages - 1" @click="goToPage(currentPage + 1)">{{ currentPage + 1 }}</button>
            <button v-if="currentPage < totalPages - 2" @click="goToPage(currentPage + 2)">{{ currentPage + 2 }}</button>

            <button v-if="currentPage < 6">...</button>
            <button v-if="currentPage !== totalPages" @click="goToPage(totalPages)">{{ totalPages }}</button>
          </div>
          <button
            v-else
            v-for="index in totalPages"
            :key="index"
            @click="goToPage(index)"
            :style="index === currentPage ? { backgroundColor: 'seagreen', color: '#fff' } : undefined"
            :disabled="index === currentPage"
          >
            {{ index }}
          </button>
          <button class="next" @click="goNext" :disabled="currentPage === totalPages">
            <Icon icon="ic:twotone-greater-than" color="#000" width="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .keuringen {
    font-family: 'Rubik', sans-serif;
  }

  .title {
    display: flex;
    align-items: center;
    max-width: 1350px;
    width: 100%;
    margin: auto;
    padding-block: 2rem;
  }

  .table-actions {
    position: absolute;
    top: -3rem;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1rem;
  }

  .add-keuring-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: seagreen;
    color: #fff;
    margin-right: 1rem;
    padding: 0.5rem;
    border-radius: 5px;
    border: none;
    cursor: pointer;
  }

  .searchbar {
    display: flex;
    align-items: center;
    border: 1px solid lightgrey;
    border-radius: 5px;
    transition: outline 0.2s ease;

    &:focus-within {
      border: 1px solid #000;
    }

    .icon {
      position: absolute;
      width: 40px;
    }

    input {
      width: 300px;
      padding: 0.75rem;
      background-color: #fff;
      border: 1px solid grey;
      border-radius: inherit;
      font-family: 'Rubik', sans-serif;
      outline: none;
      border: none;
      padding-left: 40px;
      padding-right: 16px;
    }
  }

  .table-wrapper {
    max-width: 1350px;
    margin: auto;
    position: relative;

    table {
      position: relative;
      width: 100%;
      border-spacing: 0;
      border-collapse: collapse;

      th {
        padding: 20px 20px;
        text-align: left;
        text-transform: uppercase;
      }

      tr:first-child {
        z-index: 10;
        position: sticky;
        top: 75px;
        width: 100%;
        background-color: #fff;
      }

      tr:nth-child(2n + 2):not(:first-child) {
        background-color: rgb(246, 246, 246);
      }

      button {
        display: flex;
      }
    }

    .acties {
      span {
        cursor: pointer;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.25rem;
      width: fit-content;
      margin: 30px auto;

      .gap {
        display: flex;
        gap: 0.25rem;
      }

      .previous,
      .next {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      button {
        cursor: pointer;
        font-weight: bold;
        font-family: 'Rubik', sans-serif;
        width: 31px;
        height: 31px;
        background-color: rgb(237, 242, 247);
        border: none;
        border-radius: 5px;

        &:disabled {
          cursor: not-allowed;
        }
      }
    }

    .geen-keuringen-gevonden {
      display: flex;
      flex-direction: column;
      align-items: center;

      .p-image {
        margin-top: 8rem;
        margin-bottom: 2rem;
      }
    }
  }
</style>
