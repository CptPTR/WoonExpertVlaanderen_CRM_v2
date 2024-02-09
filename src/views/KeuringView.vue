<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { ToegangEenheid } from "@/enums/modules/ToegangEenheid";
import { useCertificaatStore } from "@/stores/certificatenStore";
import { useExtraDocumentStore } from "@/stores/extraDocumentenStore";
import { useKeuringenStore } from "@/stores/keuringenStore";
import type { KeuringData } from "@/types";
import { formatFileSize } from "@/utils/formatting";
import { Icon } from "@iconify/vue";
import Badge from "primevue/badge";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getStatusColor } from "./../utils/colors";

const route = useRoute();
const router = useRouter();
const paramId = route.params.id as string;

const keuringenStore = useKeuringenStore();
const certificatenStore = useCertificaatStore();
const extraDocumentenStore = useExtraDocumentStore();

const keuring = ref<KeuringData>();

const deleteKeuring = (id: string) => {
    router.replace({ path: '/keuringen' })
}

const editKeuring = (id: string) => {
    router.push(`/keuringen/${id}/edit`)
}

const handleClickGoBackButton = () => {
    certificatenStore.empty();
    extraDocumentenStore.empty();
    router.back()
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
    const { data } = await supabase.from('extra_documenten').select('id, created_at, naam, type, size, adres_ID').eq("adres_ID", id)

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

onMounted(async () => {
    keuring.value = keuringenStore.getKeuring(paramId);

    if (keuring.value && keuring.value.id) {
        await getCertificatenData(keuring.value.id)
    }

    if (keuring.value && keuring.value.adres.id) {
        await getExtraDocumentenData(keuring.value.adres.id)
    }
})

// onBeforeMount(() => {
//     certificatenStore.$reset;
//     extraDocumentenStore.$reset;
// })

</script>

<template>
    <div class="container keuring" v-if="keuring">
        <div class="title">
            <span class="back-btn" @click="handleClickGoBackButton">
                <Icon icon="mdi:arrow-left" width="30" />
            </span>
            <h1 v-if="keuring.adres">{{ keuring.type ?? '' }} Keuring - {{ `${keuring.adres.straatnaam}
                            ${keuring.adres.nummer},
                            ${keuring.adres.vlaamse_stad.postcode} ${keuring.adres.vlaamse_stad.gemeente}` }}</h1>
            <h1 v-else>loading keuring...</h1>
        </div>
        <div class="badges">
            <div class="info">
                <span :title="`aangemaakt door ${keuring.created_by.organisatie.naam}`" class="created-by">
                    {{ keuring.created_by.organisatie.naam }}
                </span>
                <span :title="keuring.toegang_eenheid" class="toegang-eenheid">
                    <Icon :icon="keuring.toegang_eenheid === ToegangEenheid.KLANT ? 'mdi:handshake-outline' : 'mdi:key'"
                        width="20" color="#fff" />
                </span>
                <span title="status" :style="{ backgroundColor: `${getStatusColor(keuring.status)}` }">
                    {{ keuring.status }}
                </span>
                <span v-if="keuring.datum_plaatsbezoek" title="datum plaatsbezoek" class="datum-plaatsbezoek">
                    <Icon icon="mdi:calendar-check" width="20" />
                    {{ keuring.datum_plaatsbezoek.toLocaleString("nl-BE", {
                        timeZone: "Europe/Brussels", day: "numeric", month: "2-digit", year: "2-digit", hour: "2-digit", minute:
                            "2-digit"
                    }) }}
                </span>
            </div>
            <div class="actions" v-if="keuring.id">
                <span title="wijzig keuring" @click="editKeuring(keuring.id)">
                    <Icon icon="mdi:edit" width="20" color="#000" />
                </span>
                <span title="verwijder keuring" @click="deleteKeuring(keuring.id)">
                    <Icon icon="mdi:delete" width="20" color="#000" />
                </span>
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
                <div class="fac" v-if="keuring.facturatie">
                    <h2>Facturatie</h2>
                    <span>
                        <Icon icon="mdi:account" width="20" />
                        {{ `${keuring.facturatie.voornaam} ${keuring.facturatie.achternaam}` }}
                    </span>
                    <span>
                        <Icon icon="mdi:at" width="20" />
                        {{ keuring.facturatie.emailadres }}
                    </span>
                    <span>
                        <Icon icon="mdi:phone" width="20" />
                        {{ keuring.facturatie.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') }}
                    </span>
                    <span>
                        <Icon icon="mdi:home" width="20" />
                        {{ `${keuring.facturatie.straatnaam} ${keuring.facturatie.nummer}` }}
                    </span>
                    <span>
                        <Icon icon="mdi:city" width="20" />
                        {{ `${keuring.facturatie.vlaamse_stad.postcode} ${keuring.facturatie.vlaamse_stad.gemeente}` }}
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
                                <!-- <Icon icon="mdi:file-pdf" width="20" color="red" /> -->
                                <div>
                                    <span class="naam">
                                        {{ certificaat.naam }}
                                    </span>
                                    <span class="size">
                                        ({{ formatFileSize(certificaat.size) }})
                                    </span>
                                </div>
                                <a href="" download>
                                    <Icon class="download" icon="mdi:download" width="20" />
                                </a>
                            </li>
                        </ul>
                        <div v-else>
                            Geen certificaten beschikbaar
                        </div>
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
                                <!-- <span class="type">
                                    {{ extraDoc.type }}
                                </span>
                                | -->
                                <!-- <Icon icon="mdi:file-pdf" width="20" color="red" /> -->
                                <div>

                                    <span class="naam">
                                        {{ extraDoc.naam }}
                                    </span>
                                    <span class="size">
                                        ({{ formatFileSize(extraDoc.size) }})
                                    </span>
                                </div>
                                <a href="" download>
                                    <Icon class="download" icon="mdi:download" width="20" />
                                </a>
                            </li>
                        </ul>
                        <div v-else>
                            Geen extra documenten beschikbaar
                        </div>
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
            background-color: #E2E8F0;
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
            // background-color: darkcyan;
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
            background-color: #E2E8F0;
        }
    }

    span {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        // font-size: 1.6rem;
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
    box-shadow: 0 26px 58px 0 rgba(0, 0, 0, .22),
        0 5px 14px 0 rgba(0, 0, 0, .18);

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
</style>