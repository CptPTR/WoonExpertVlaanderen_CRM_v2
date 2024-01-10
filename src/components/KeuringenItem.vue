<script setup lang="ts">
import { Status } from "@/enums/modules/Status";
import { formatDate } from "@/utils/formatting";
import { getStatusColor } from "@/utils/colors";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import type { Keuring } from "../types";

const emit = defineEmits(['view-keuring', 'edit-keuring', 'delete-keuring'])

const { keuring } = defineProps<{
    keuring: Keuring
}>()

const isBinOpen = ref(false)
const isDeleteConfirmationOpen = ref(false)

const showOpenBin = () => {
    isBinOpen.value = true;
}

const showClosedBin = () => {
    isBinOpen.value = false;
}

const viewKeuring = () => {
    emit('view-keuring', keuring.id)
}

const editKeuring = () => {
    emit('edit-keuring', keuring.id)
}

const deleteKeuring = () => {
    emit('delete-keuring', keuring.id)
}
</script>

<template>
    <td v-if="keuring.datum_toewijzing">
        {{ new Date(keuring.datum_toewijzing).toLocaleDateString("nl-BE", {
            day: "2-digit", month: "2-digit", year:
                "numeric", hour: "numeric", minute: "numeric"
        }) }}
    </td>
    <td>
        {{ keuring.created_by.organisatie.naam }}
    </td>
    <td class="klant" v-if="keuring.klant">
        <span class="naam">
            {{ keuring.klant.voornaam + " " + keuring.klant.achternaam }}
        </span>
        <br />
        <span class="emailadres">
            {{ keuring.klant.emailadres }}
        </span>
    </td>
    <td class="adres" v-if="keuring.adres">
        <span class="straatnaam-nummer">
            {{ keuring.adres.straatnaam + " " + keuring.adres.nummer }}
        </span>
        <br />
        <span class="gemeente">
            {{ keuring.adres.vlaamse_stad.gemeente }}
        </span>
    </td>
    <td v-if="keuring.type">
        {{ keuring.type.toUpperCase() }}
    </td>
    <td>
        <div class="status" :style="{ backgroundColor: getStatusColor(keuring.status) }">

            <template v-if="keuring.status === Status.INGEPLAND && keuring.datum_plaatsbezoek">
                {{ formatDate(new Date(keuring.datum_plaatsbezoek)) }}
            </template>
            <template v-else>
                {{ keuring.status }}
            </template>
        </div>
    </td>
    <td class="actions">
        <span title="keuring bekijken" @click="viewKeuring">
            <Icon icon="mdi:open-in-new" color="grey" width="24" />
        </span>
        <span title="keuring aanpassen" @click="editKeuring">
            <Icon icon="mdi:edit" color="grey" width="24" />
        </span>
        <span title="keuring verwijderen" @mouseenter="showOpenBin" @mouseleave="showClosedBin"
            @click="isDeleteConfirmationOpen = true">
            <Icon v-show="!isBinOpen" icon="mdi:bin" color="grey" width="24" />
            <Icon v-show="isBinOpen" icon="mdi:bin-empty" color="grey" width="24" />

            <Teleport to="body">
                <div v-if="isDeleteConfirmationOpen" class="modal">
                    <div class="content">
                        <h2>Bent u zeker dat u deze keuring wilt verwijderen?</h2>
                        <ul>
                            <li>
                                {{ keuring.type?.toUpperCase() }}
                            </li>
                            <li>
                                {{ keuring.status }}
                            </li>
                            <li v-if="keuring.datum_plaatsbezoek">
                                - {{ keuring.datum_plaatsbezoek ? new
                                    Date(keuring.datum_plaatsbezoek).toLocaleDateString("nl-BE") : "" }}
                            </li>
                            <li v-else>
                                Datum plaatsbezoek (nog) niet ingepland
                            </li>
                            <li>
                                {{ keuring.adres?.straatnaam + " " + keuring.adres?.nummer + ", " +
                                    keuring.adres?.vlaamse_stad.gemeente
                                }}
                            </li>
                            <li>
                                {{ keuring.klant.voornaam + " " + keuring.klant.achternaam }}
                            </li>
                            <li>
                                - {{ keuring.klant.telefoonnummer }}
                            </li>
                            <li>
                                - {{ keuring.klant.emailadres }}
                            </li>
                        </ul>
                        <div class="actions">
                            <button class="cancel" title="Annuleer"
                                @click="isDeleteConfirmationOpen = false">Annuleer</button>
                            <button class="delete" title="Verwijder keuring" @click="deleteKeuring">Verwijder
                                keuring</button>
                        </div>
                    </div>
                </div>
                <template v-else />
            </Teleport>
        </span>
    </td>
</template>


<style lang="scss" scoped>
td {
    font-size: 1.3rem;
    padding: 20px;
}

.klant {
    .naam {
        font-size: 1.3rem;
        font-weight: bold;
    }
}

.adres {
    .straatnaam-nummer {
        font-size: 1.3rem;
        font-weight: bold;
    }
}

.actions {
    gap: 2px;
    text-align: right;

    span {
        display: inline-block;
        margin-left: 5px;
        cursor: pointer;
    }
}

.status {
    font-size: 1.3rem;
    width: fit-content;
    padding: 1.2rem 2rem;
    border-radius: 45px;
    color: #fff;
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
    font-family: "Rubik", sans-serif;

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
                font-family: "Rubik", sans-serif;
            }

            .delete {
                background-color: #DC3545;
                color: #fff;
                font-family: "Rubik", sans-serif;
            }
        }
    }
}
</style>@/utils/colors