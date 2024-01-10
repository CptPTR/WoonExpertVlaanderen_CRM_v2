<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { Status } from "@/enums/modules/Status";
import router from "@/router";
import { useKeuringStore } from "@/stores/keuringenStore";
import { useVlaamseStedenStore } from "@/stores/vlaamseStedenStore";
import type { Keuring } from "@/types";
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref } from "vue";
import KeuringenItem from "../components/KeuringenItem.vue";

const keuringStore = useKeuringStore()
const vlaamseStedenStore = useVlaamseStedenStore()

const filterOp = ref<string>("");
const currentPage = ref<number>(1);
const MAX_ROWS = 9;

const getLijstGemeenten = async () => {
  const { data } = await supabase.from('vlaamse_steden').select()

  if (data) {
    data.map((vlaamseStad) => {
      vlaamseStedenStore.addStad({
        id: vlaamseStad.id,
        gemeente: vlaamseStad.gemeente,
        stad: vlaamseStad.stad,
        provincie: vlaamseStad.provincie
      })
    })
  }
}

const getKeuringData = async () => {
  const { data } = await supabase
    .from('keuringen')
    .select("*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*))");

  if (data) {
    data.map(keuring => {
      keuringStore.addKeuring({
        id: keuring.id,
        klant: {
          id: keuring.klant.id,
          voornaam: keuring.klant.voornaam,
          achternaam: keuring.klant.achternaam,
          emailadres: keuring.klant.emailadres,
          telefoonnummer: keuring.klant.telefoonnummer
        },
        adres: {
          id: keuring.adres.id,
          straatnaam: keuring.adres.straatnaam,
          nummer: keuring.adres.nummer,
          vlaamse_stad: keuring.adres.vlaamse_stad,
        },

        status: keuring.status,
        type: keuring.type,
        toegang_eenheid: keuring.toegang_eenheid,
        datum_toewijzing: new Date(keuring.created_at),
        datum_plaatsbezoek: new Date(keuring.datum_plaatsbezoek),
        created_by: keuring.created_by,
        opmerking: keuring.opmerking,
        facturatie: null,
      })
    })
  }
}

const finalKeuringen = computed(() => {
  return filterKeuringen().sort(sortKeuringen);
})

const filterKeuringen = () => {
  return keuringStore.keuringen.filter((keuring) => {
    if (keuring.klant) {
      return keuring.klant.voornaam.includes(filterOp.value) || keuring.adres.straatnaam.includes(filterOp.value)
    }
    return false
  })
}

const sortKeuringen = (keuringA: Keuring, keuringB: Keuring) => {
  const statusOrder = {
    [Status.NIEUW]: 1,
    [Status.INGEPLAND]: 2,
    [Status.IN_BEHANDELING]: 3,
    [Status.CERTIFICAAT_BESCHIKBAAR]: 4,
  };

  const getStatusOrder = (status: Status) => statusOrder[status] || 0;

  const compareStatus = getStatusOrder(keuringA.status) - getStatusOrder(keuringB.status);

  if (compareStatus !== 0) {
    return compareStatus;
  }

  const dateComparator = (dateA: Date, dateB: Date) => {
    const timestampA = dateA.getTime()
    const timestampB = dateB.getTime()

    return timestampA - timestampB;
  };

  if (keuringA.status === Status.INGEPLAND || keuringA.status === Status.IN_BEHANDELING) {
    if (keuringA.datum_plaatsbezoek && keuringB.datum_plaatsbezoek) {
      return dateComparator(keuringA.datum_plaatsbezoek, keuringB.datum_plaatsbezoek);
    }
  }

  if (keuringA.status === Status.NIEUW || keuringA.status === Status.CERTIFICAAT_BESCHIKBAAR) {
    return -dateComparator(keuringA.datum_toewijzing, keuringB.datum_toewijzing);
  }

  return 0
}

const totalPages = computed(() => {
  return Math.ceil(finalKeuringen.value.length / MAX_ROWS);
})


const zoekKeuringen = (event: Event) => {
  currentPage.value = 1;
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
  const { error } = await supabase.from('keuringen').delete().eq("id", id);

  if (error) {
    console.error(`Could not delete keuring with id ${id} from the database.`)
  } else {
    keuringStore.removeKeuring(id)
  }
}

const goBack = () => {
  currentPage.value--
}

const goNext = () => {
  currentPage.value++
}

const goToPage = (index: number) => {
  currentPage.value = index;
}

onMounted(() => {
  if (!keuringStore.keuringen.length) {
    getKeuringData()
  }
  if (!vlaamseStedenStore.vlaamse_steden.length) {
    getLijstGemeenten()
  }
})

</script>

<template>
  <div class="container keuringen">
    <div class="title-searchbar">
      <h1>Keuringen</h1>
      <div class="add-searchbar">
        <div class="add-keuring" @click="addKeuring">
          <Icon icon="mdi:add" width="15" />
        </div>
        <div class="searchbar">
          <Icon icon="mdi:magnify" width="24" color="lightgrey" class="icon" />
          <input id="zoekKeuringen" name="zoekKeuringen" type="text" placeholder="Zoek klant/adres..."
            @input="zoekKeuringen" />
        </div>
      </div>
    </div>
    <div class="table-wrapper">
      <table v-if="keuringStore.keuringen.length !== 0">
        <tr>
          <th>datum <br /> toewijzing</th>
          <th>aangemaakt door</th>
          <th>klant</th>
          <th>adres</th>
          <th>type</th>
          <th>status</th>
          <th>acties</th>
        </tr>
        <tr v-for="keuring in finalKeuringen.slice((MAX_ROWS * currentPage) - MAX_ROWS, MAX_ROWS * currentPage)"
          :key="keuring.id">
          <KeuringenItem :keuring="keuring" @view-keuring="viewKeuring" @edit-keuring="editKeuring"
            @delete-keuring="deleteKeuring" />
        </tr>
      </table>
      <div v-else>
        <p>Helaas, geen keuringen gevonden!</p>
      </div>
      <div class="pagination" v-if="keuringStore.keuringen.length > 0">
        <button class="previous" @click="goBack" :disabled="currentPage === 1">
          <Icon icon="ic:twotone-less-than" color="#000" width="15" />
        </button>
        <button v-for="index in totalPages" :key="index" @click="goToPage(index)"
          :style="index === currentPage ? { backgroundColor: 'green', color: '#fff' } : undefined"
          :disabled="index === currentPage">
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
  font-family: "Rubik", sans-serif;
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
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: green;
      color: #fff;
      margin-right: 1rem;
      width: 4rem;
      height: 4rem;
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
        height: 40px;
        background-color: #fff;
        border-radius: inherit;
        outline: none;
        border: none;
        padding-left: 40px;
        padding-right: 16px;
        align-self: flex-end;
        font-size: 1.3rem;

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
        position: sticky;
        top: 220px;
        background-color: #fff;
      }

      th {
        padding: 10px 20px;
        text-transform: uppercase;
        font-size: 1.3rem;

        &:last-of-type {
          text-align: right;
        }
      }

      &:nth-child(2n+2):not(:first-child) {
        background-color: rgb(246, 246, 246);
      }
    }

    button {
      display: flex;
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
      font-size: 1.3rem;
      font-weight: bold;
      font-family: "Rubik", sans-serif;
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
}
</style>
