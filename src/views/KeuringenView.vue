<script setup lang="ts">
  import KeuringenItem from '@/components/KeuringenItem.vue'
  import { supabase } from '@/config/supabase'
  import { Status } from '@/enums/modules/Status'
  import router from '@/router'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import type { KeuringData } from '@/types'
  import { Icon } from '@iconify/vue'
  import Image from 'primevue/image'
  import { computed, ref } from 'vue'

  const keuringenStore = useKeuringenStore()

  const filterOp = ref<string>('')
  const currentPage = ref<number>(1)
  const MAX_ROWS = 9

  const finalKeuringen = computed(() => {
    return filterKeuringen().sort(sortKeuringen)
  })

  const filterKeuringen = () => {
    return keuringenStore.keuringen.filter((keuring) => {
      if (keuring.klant) {
        return (
          `${keuring.klant.voornaam} ${keuring.klant.achternaam}`.toLowerCase().includes(filterOp.value.toLowerCase()) || keuring.adres.straatnaam.toLowerCase().includes(filterOp.value.toLowerCase())
        )
      }
    })
  }

  const sortKeuringen = (keuringA: KeuringData, keuringB: KeuringData) => {
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
    <div class="title-searchbar">
      <h1>Keuringen</h1>
      <div class="add-searchbar">
        <div class="add-keuring" @click="addKeuring">
          <Icon icon="mdi:plus" width="15" />
        </div>
        <div class="searchbar">
          <Icon icon="mdi:magnify" width="24" color="lightgrey" class="icon" />
          <input id="zoekKeuringen" name="zoekKeuringen" type="text" placeholder="Zoek klant/adres..." @input="zoekKeuringen" />
        </div>
      </div>
    </div>
    <div class="table-wrapper">
      <div v-if="keuringenStore.keuringen.length !== 0">
        <table>
          <tr>
            <th>
              datum <br />
              toewijzing
            </th>
            <th>aangemaakt door</th>
            <th>type</th>
            <th>klant</th>
            <th>adres</th>
            <th>status</th>
            <th></th>
          </tr>
          <tr v-for="keuring in finalKeuringen.slice(MAX_ROWS * currentPage - MAX_ROWS, MAX_ROWS * currentPage)" :key="keuring.id">
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
      <div class="pagination" v-if="keuringenStore.keuringen.length > 0">
        <button class="previous" @click="goBack" :disabled="currentPage === 1">
          <Icon icon="ic:twotone-less-than" color="#000" width="15" />
        </button>
        <button
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
</template>

<style lang="scss" scoped>
  .keuringen {
    font-family: 'Rubik', sans-serif;
  }

  .title-searchbar {
    height: 120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 100px;
    background-color: #fff;
    z-index: 50;

    .add-searchbar {
      display: flex;
      align-items: center;
      align-self: flex-end;
      margin-bottom: 1rem;
      cursor: pointer;

      .add-keuring {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: seagreen;
        color: #fff;
        margin-right: 1rem;
        padding: 1em;
        border-radius: 5px;
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
          width: 500px;
          padding: 0.8em;
          background-color: #fff;
          border-radius: inherit;
          outline: none;
          border: none;
          padding-left: 40px;
          padding-right: 16px;
        }
      }
    }
  }

  .table-wrapper {
    position: relative;

    table {
      width: 100%;
      border-spacing: 0;

      tr {
        text-align: left;

        &:first-child {
          z-index: 1;
          position: sticky;
          top: 220px;
          background-color: #fff;
        }

        th {
          padding: 10px 20px;
          text-transform: uppercase;

          &:last-of-type {
            text-align: right;
          }
        }

        &:nth-child(2n + 2):not(:first-child) {
          background-color: rgb(246, 246, 246);
        }
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
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      width: fit-content;
      margin: 30px auto;

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
        width: 35px;
        height: 35px;
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
