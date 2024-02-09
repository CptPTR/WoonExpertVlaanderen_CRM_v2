<script setup lang="ts">
import { Status } from "@/enums/modules/Status";
import { getStatusColor } from "@/utils/colors";
import { formatDate } from "@/utils/formatting";
import { Icon } from "@iconify/vue";
import { vOnClickOutside } from '@vueuse/components';
import { ref } from "vue";
import type { KeuringData } from "../types";

const emit = defineEmits(['view-keuring', 'duplicate-keuring', 'edit-keuring', 'delete-keuring'])

const { keuring } = defineProps<{
    keuring: KeuringData,
}>()

const isDeleteConfirmationOpen = ref(false)
const isActionsMenuOpen = ref<boolean>(false);

const toggleActionsMenu = () => {
    isActionsMenuOpen.value = !isActionsMenuOpen.value;
};

const closeActionsMenu = () => {
    isActionsMenuOpen.value = false
}

const viewKeuring = () => {
    emit('view-keuring', keuring.id)
}

const duplicateKeuring = () => {
    emit('duplicate-keuring', keuring.id)
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
        {{ keuring.datum_toewijzing.toLocaleString("nl-BE", {
            timeZone: "Europe/Brussels", day: "numeric", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit"
        })
        }}
    </td>
    <td>
        {{ keuring.created_by.organisatie.naam }}
    </td>
    <td v-if="keuring.type">
        {{ keuring.type.toUpperCase() }}
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
    <td>
        <div class="status" :style="{ backgroundColor: getStatusColor(keuring.status) }">
            <template v-if="keuring.status === Status.INGEPLAND && keuring.datum_plaatsbezoek">
                {{ keuring.status + ' op ' + formatDate(new Date(keuring.datum_plaatsbezoek)) }}
            </template>
            <template v-else>
                {{ keuring.status }}
            </template>
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
                <li @click="duplicateKeuring">
                    <Icon icon="mdi:content-copy" width="14" />
                    Dupliceren
                </li>
                <li @click="editKeuring">
                    <Icon icon="mdi:pencil" width="14" />
                    Aanpassen
                </li>
                <li @click="isDeleteConfirmationOpen = true; isActionsMenuOpen = false">
                    <Icon icon="mdi:delete" width="14" />
                    Verwijderen
                </li>

            </ul>
        </div>
        <Teleport to="body">
            <div v-if="isDeleteConfirmationOpen" class="modal">
                <div class="content">
                    <h2>Bent u zeker dat u deze keuring wilt verwijderen?</h2>
                    <ul v-if="keuring">
                        <li>
                            {{ keuring.type.toUpperCase() }}
                        </li>
                        <li>
                            {{ keuring.status }}
                        </li>
                        <li v-if="keuring.datum_plaatsbezoek">
                            - {{ keuring.datum_plaatsbezoek }}
                        </li>
                        <li v-else>
                            Datum plaatsbezoek (nog) niet ingepland
                        </li>
                        <li>
                            {{ keuring.adres.straatnaam + " " + keuring.adres.nummer + ", " +
                                keuring.adres.vlaamse_stad.gemeente
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
                        <button class="cancel" title="Annuleer" @click="isDeleteConfirmationOpen = false">Annuleer</button>
                        <button class="delete" title="Verwijder keuring" @click="deleteKeuring">Verwijder keuring</button>
                    </div>
                </div>
            </div>
            <template v-else />
        </Teleport>
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
            gap: 1rem;
            padding: 1rem;
            cursor: pointer;
            font-size: 1.1rem;
            background-color: #fff;

            &:hover {
                background-color: seagreen;
                color: #fff;
            }
        }
    }
}

.status {
    width: fit-content;
    padding: 1rem 1.5rem;
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
</style>