<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { Status } from "@/enums/modules/Status";
import { ToegangEenheid } from "@/enums/modules/ToegangEenheid";
import { TypeKeuring } from "@/enums/modules/TypeKeuring";
import { useCertificaatStore } from "@/stores/certificatenStore";
import { useExtraDocumentStore } from "@/stores/extraDocumentenStore";
import { useKeuringStore } from "@/stores/keuringenStore";
import type { Keuring } from "@/types";
import { formatFileSize } from "@/utils/formatting";
import { Icon } from "@iconify/vue";
import { onBeforeUpdate, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getStatusColor } from "./../utils/colors";

const route = useRoute();
const router = useRouter();
const paramId = route.params.id as string;

const keuringStore = useKeuringStore();
const certificatenStore = useCertificaatStore();
const extraDocumentenStore = useExtraDocumentStore();

const keuring = ref<Keuring | null>();

const deleteKeuring = (id: string) => {
    router.replace({ path: '/keuringen' })
}

const editKeuring = (id: string) => {
    router.push(`/keuringen/${id}/edit`)
}

const getCurrentlyOpenedKeuringData = async (id: string) => {
    const { data } = await supabase
        .from('keuringen')
        .select("*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*))")
        .eq("id", id)
        .single()

    if (data) {
        keuringStore.addCurrentlyOpenedKeuring(data.id)
    }

    keuring.value = data
}

const getCertificatenData = async (id: string) => {
    const { data } = await supabase.from('certificaten').select("id, created_at, name, type, size").eq("keuringID", id)

    if (data) {
        data.map((cert) => {
            certificatenStore.addCertificaat({
                naam: cert.name,
                size: cert.size,
                type: cert.type,
            })
        })
    }
}

const getExtraDocumentenData = async (id: string) => {
    const { data } = await supabase.from('extra_documenten').select("id, created_at, naam, type, size").eq("adres_ID", id)

    if (data) {
        data.map((document) => {
            extraDocumentenStore.addExtraDocument({
                naam: document.naam,
                size: document.size,
                type: document.type
            })
        })
    }

    if (!certificatenStore.certificaten.length) {
        getCertificatenData(paramId)
    }
}

const handleClickGoBackButton = () => {
    keuringStore.currentlyOpenedKeuring = null;
    certificatenStore.empty();
    extraDocumentenStore.empty();
    router.back()
}

onMounted(() => {
    if (!keuringStore.currentlyOpenedKeuring) {
        getCurrentlyOpenedKeuringData(paramId)
    } else {
        // keuring.value = keuringStore.currentlyOpenedKeuring
    }
})

onBeforeUpdate(() => {
    // if (!extraDocumentenStore.extra_documenten.length) {
    //     if (keuringStore.currentlyOpenedKeuring) {
    //         getExtraDocumentenData(keuringStore.currentlyOpenedKeuring.adres?.id as string)
    //     }
    // }
})
</script>

<template>
    <div class="container keuring" v-if="keuring">
        <div class="title">
            <span class="back-btn" @click="handleClickGoBackButton">
                <Icon icon="mdi:arrow-left" width="30" />
            </span>
            <h1 v-if="keuring.adres">{{ keuring.type ?? '' }} Keuring - {{ `${keuring.adres.straatnaam}
                            ${keuring.adres.nummer},
                            ${keuring.adres.vlaamse_stad.gemeente}` }}</h1>
            <h1 v-else>loading keuring...</h1>
        </div>
        <div class="badges" v-if="keuring">
            <div class="info">
                <span :title="`aangemaakt door ${keuring.created_by.organisatie.naam}`" class="created-by">
                    {{ keuring.created_by.organisatie.naam }}
                </span>
                <span title="status" :style="{ backgroundColor: `${getStatusColor(keuring.status)}` }">
                    {{ keuring.status }}
                    <template v-if="keuring.status === Status.INGEPLAND && keuring.datum_plaatsbezoek">
                        {{ " >> " + new Date(keuring.datum_plaatsbezoek).toLocaleDateString("nl-BE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                        }) }}
                    </template>
                </span>
                <span :title="keuring.toegang_eenheid" class="toegang-eenheid">
                    <Icon :icon="keuring.toegang_eenheid === ToegangEenheid.KLANT ? 'mdi:handshake-outline' : 'mdi:key'"
                        width="20" color="#fff" />
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
        <div class="content" v-if="keuring">
            <div class="column">
                <div class="klant" v-if="keuring.adres">
                    <h2>Klant</h2>
                    <ul>
                        <li>
                            <Icon icon="mdi:account" width="21" />
                            <span>{{ `${keuring.klant.voornaam} ${keuring.klant.achternaam}` }}</span>
                        </li>
                        <li>
                            <Icon icon="mdi:email" width="21" />
                            <span>{{ keuring.klant.emailadres }}</span>
                        </li>
                        <li>
                            <Icon icon="mdi:phone" width="21" />
                            <span>{{ keuring.klant.telefoonnummer }}</span>
                        </li>
                    </ul>
                </div>
                <div class="facturatie">
                    <h2>Facturatie</h2>
                    <ul v-if="keuring.klant">
                        <li>
                            <Icon icon="mdi:account" width="21" />
                            <span>{{ `${keuring.klant.voornaam} ${keuring.klant.achternaam}` }}</span>

                        </li>
                        <li>
                            <Icon icon="mdi:email" width="21" />
                            <span>{{ keuring.klant.emailadres }}</span>

                        </li>
                        <li>
                            <Icon icon="mdi:phone" width="21" />
                            <span>{{ keuring.klant.telefoonnummer }}</span>

                        </li>
                        <li>
                            <Icon icon="mdi:home" width="21" />
                            <span>{{ `${keuring.adres.straatnaam} ${keuring.adres.nummer}` }}</span>

                        </li>
                        <li>
                            <Icon icon="mdi:city" width="21" />
                            <span>{{ keuring.adres.vlaamse_stad.gemeente }}</span>

                        </li>
                    </ul>
                    <div v-else></div>
                </div>
            </div>
            <div class="column">
                <div class="certificaten">
                    <h2>Certificaten</h2>
                    <div class="epc-asbest">
                        <div class="epc" v-if="certificatenStore.certificaten">
                            <h3>EPC</h3>
                            <div class="certificaat-wrapper"
                                v-if="certificatenStore.certificaten.filter((cert) => cert.type === TypeKeuring.EPC).length !== 0">
                                <div class="certificaat"
                                    v-for="certificaat in certificatenStore.certificaten.filter((cert) => cert.type === TypeKeuring.EPC)"
                                    :key="certificaat.id">
                                    <div class="naam-size">
                                        <span class="naam">{{ certificaat.naam }}</span>
                                        <span class="size">
                                            {{ formatFileSize(certificaat.size ?? 0) }}
                                        </span>
                                    </div>
                                    <div class="download" title="download EPC certificaat">
                                        <a href="src\assets\documents\PDC_CV_2023.pdf" download>
                                            <Icon icon="mdi:download" width="21" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <p v-else>
                                -
                            </p>
                        </div>

                        <div class="asbest"
                            v-if="certificatenStore.certificaten.filter((cert) => cert.type === TypeKeuring.ASBEST).length !== 0">
                            <h3>Asbest</h3>
                            <div class="certificaat-wrapper"
                                v-if="certificatenStore.certificaten.filter((cert) => cert.type === TypeKeuring.ASBEST).length !== 0">
                                <div class="certificaat"
                                    v-for="certificaat in certificatenStore.certificaten.filter((cert) => cert.type === TypeKeuring.ASBEST)"
                                    :key="certificaat.id">
                                    <div class="naam-size">
                                        <span class="naam">{{ certificaat.naam }}</span>
                                        <span class="size">
                                            {{ formatFileSize(certificaat.size ?? 0) }}
                                        </span>
                                    </div>
                                    <div class="download" title="download asbest certificaat">
                                        <Icon icon="mdi:download" width="21" />
                                    </div>
                                </div>
                            </div>
                            <p v-else>
                                -
                            </p>
                        </div>
                    </div>
                </div>
                <div class="opmerking">
                    <h2>Opmerkingen</h2>
                    <p>{{ keuring.opmerking || 'Geen opmerkingen' }}</p>
                </div>
                <div class="extradocs">
                    <h2>Extra <br /> documenten</h2>
                    <div v-if="extraDocumentenStore.extra_documenten.length !== 0">
                        <div class="document" v-for="document in extraDocumentenStore.extra_documenten" :key="document.id">
                            <div class="naam-size">
                                <span class="naam">{{ document.naam }}</span>
                                <span class="size">
                                    {{ formatFileSize(document.size ?? 0) }}
                                </span>
                            </div>
                            <div class="download" title="download asbest certificaat">
                                <Icon icon="mdi:download" width="21" />
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <span class="geen-extra-docs">
                            Geen extra documenten
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.keuring {
    font-family: "Rubik", sans-serif;
    display: flex;
    flex-direction: column;

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

        .info {
            display: flex;
            gap: 5px;

            .created-by {
                position: relative;
                background-color: lightseagreen;

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
            font-size: 1.6rem;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
        }
    }

    .content {
        display: flex;
        flex-wrap: wrap;
        margin-top: 10px;
        position: relative;
        padding: 45px;
        box-shadow: 0 26px 58px 0 rgba(0, 0, 0, .22), 0 5px 14px 0 rgba(0, 0, 0, .18);



        .column {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 50px;



            .klant {
                display: flex;
                gap: 20px;

                h2 {
                    flex: 2;
                }

                ul {
                    flex: 5;
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    border-left: solid 1px #000;
                    padding-left: 20px;

                    li {
                        display: flex;
                        align-items: center;

                        span {
                            margin-left: 20px;
                            font-size: 1.6rem;
                        }
                    }
                }
            }

            .facturatie {
                display: flex;
                gap: 20px;

                h2 {
                    flex: 2;
                }

                ul {
                    flex: 5;
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    border-left: solid 1px #000;
                    padding-left: 20px;

                    li {
                        display: flex;
                        align-items: center;

                        span {
                            margin-left: 20px;
                            font-size: 1.6rem;
                        }
                    }
                }
            }

            .certificaten {
                display: flex;
                gap: 20px;

                h2 {
                    flex: 2;
                }

                .epc-asbest {
                    flex: 5;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    gap: 20px;
                    border-left: solid 1px #000;
                    padding-left: 20px;

                    p {
                        font-size: 1.6rem;
                    }

                    .epc,
                    .asbest {
                        display: flex;
                        overflow: hidden;

                        .certificaat-wrapper {
                            flex: 1;

                            .certificaat {
                                display: flex;
                                justify-content: space-between;
                                flex: 1;
                            }

                            .naam-size {
                                display: flex;
                                flex-direction: column;

                                .naam {
                                    font-size: 1.6rem;
                                }

                                .size {
                                    font-size: 1.2rem;
                                }
                            }
                        }

                    }
                }
            }

            .extradocs {
                display: flex;
                gap: 20px;

                h2 {
                    flex: 2;
                }

                span {
                    font-size: 1.6rem;
                }

                >div {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    flex: 5;
                    border-left: solid 1px #000;
                    padding-left: 20px;

                    .document {
                        flex: 1;
                        display: flex;
                        justify-content: space-between;

                    }

                    .naam-size {
                        flex: 1;
                        display: flex;
                        flex-direction: column;

                        span {
                            font-size: 1.6rem;
                        }

                        .size {
                            font-size: 1.2rem;
                        }
                    }
                }

                .geen-extra-docs {
                    margin-top: 8px;
                }
            }

            .opmerking {
                display: flex;
                gap: 20px;

                h2 {
                    flex: 2;
                }

                p {
                    flex: 5;
                    width: 397px;
                    font-size: 1.6rem;
                    border-left: solid 1px #000;
                    padding-left: 20px;
                    max-height: 100px;
                    overflow-y: auto;

                }
            }
        }
    }

    .loading {
        // display: flex;
        // height: 450px;
        // justify-content: center;
        // align-items: center;
        // background-color: rgb(201, 201, 201);

        position: relative;
        overflow: hidden;
        width: 100%;
        height: 450px;
        background: #ccc;

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #ccc, lighten(#ccc, 7%), #ccc);
            animation: progress 1s ease-in-out infinite;
        }
    }
}
</style>../utils/colors