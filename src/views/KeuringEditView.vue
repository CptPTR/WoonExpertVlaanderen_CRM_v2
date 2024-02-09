<script setup lang="ts">
import WEVAddressForm from '@/components/WEVAddressForm.vue';
import WEVClientForm from '@/components/WEVClientForm.vue';
import WEVFacturatieForm from '@/components/WEVFacturatieForm.vue';
import { supabase } from '@/config/supabase';
import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming';
import type { Rol } from '@/enums/modules/Rol';
import { Status } from '@/enums/modules/Status';
import { ToegangEenheid } from '@/enums/modules/ToegangEenheid';
import { TypeKeuring } from '@/enums/modules/TypeKeuring';
import { useAdressenStore } from '@/stores/adressenStore';
import { useAuthStore } from '@/stores/authStore';
import { useCertificaatStore } from '@/stores/certificatenStore';
import { useExtraDocumentStore } from '@/stores/extraDocumentenStore';
import { useFacturatiesStore } from '@/stores/facturatiesStore';
import { useKeuringenStore } from '@/stores/keuringenStore';
import { useKlantenStore } from '@/stores/klantenStore';
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore';
import type { FormKeuring } from '@/types';
import { Icon } from '@iconify/vue';
import { gsap } from "gsap";
import Button from 'primevue/button';
import Checkbox from "primevue/checkbox";
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import { computed, onBeforeMount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore()
const keuringenStore = useKeuringenStore()
const vlaamseStedenStore = useVlaamseStedenStore()
const adressenStore = useAdressenStore()
const klantenStore = useKlantenStore()
const facturatiesStore = useFacturatiesStore()
const certificatenStore = useCertificaatStore()
const extraDocumentenStore = useExtraDocumentStore()
const router = useRouter()
const route = useRoute()

const loadingKeuring = ref<boolean>(true)
const keuringForm: FormKeuring = reactive({
    type: [],

    klantID: '',
    voornaam: '',
    familienaam: '',
    emailadres: '',
    telefoonnummer: '',

    adresID: '',
    straatnaam: '',
    nummer: '',
    vlaamse_stad: {
        gemeente: '',
        stad: '',
        provincie: '',
        postcode: ''
    },

    facturatieID: '',
    facturatie_bestemming: FacturatieBestemming.HETZELFDE,

    status: Status.NIEUW,
    opmerking: '',
    toegang_eenheid: ToegangEenheid.KLANT,
    datum_plaatsbezoek: null,
    epc_certificaten: [],
    asbest_certificaten: [],
    extra_documenten: [],
    created_by: {
        id: authStore.currentlyLoggedIn?.id as string,
        voornaam: authStore.currentlyLoggedIn?.voornaam as string,
        achternaam: authStore.currentlyLoggedIn?.achternaam as string,
        email: authStore.currentlyLoggedIn?.email as string,
        telefoonnummer: authStore.currentlyLoggedIn?.telefoonnummer as string,
        rol: authStore.currentlyLoggedIn?.rol as Rol,
        specialisatie: authStore.currentlyLoggedIn?.specialisatie as TypeKeuring,
        organisatie: {
            naam: authStore.currentlyLoggedIn?.organisatie.naam as string
        },
        avatar: authStore.currentlyLoggedIn?.avatar as string
    },
    facturatie: {
        bestemming: FacturatieBestemming.HETZELFDE,
        voornaam: "",
        achternaam: "",
        emailadres: "",
        telefoonnummer: "",
        straatnaam: "",
        nummer: "",
        vlaamse_stad: {
            gemeente: "",
            stad: "",
            provincie: "",
            postcode: ""
        }
    }
})

const confirmCancelFormDialog = ref<boolean>(false);
const certificatesFormVisible = ref<boolean>(false);
const extraDocsFormVisible = ref<boolean>(false);

const keuringAddress = computed(() => {
    return adressenStore.adressen.find((adres) => adres.id === keuringForm.adresID)
})

const keuringClient = computed(() => {
    return klantenStore.klanten.find((klant) => klant.id === keuringForm.klantID)
})

const keuringFacturatie = computed(() => {
    return facturatiesStore.facturaties.find((facturatie) => facturatie.id === keuringForm.facturatieID)
})

const handleDate = () => {
    keuringForm.status = Status.INGEPLAND;
}

const handleDateClear = () => {
    keuringForm.status = Status.NIEUW;
}

const uploadCertificaat = async (event: Event, typeKeuring: TypeKeuring) => {
    // const { files } = event.target as HTMLInputElement

    // if (files) {
    //     for (const file of files) {
    //         if (typeKeuring === TypeKeuring.EPC) {
    //             const { error } = await supabase.storage.from('certificaten').upload(`EPC/${file.name}`, file)
    //             if (error) {
    //                 console.log('Could not upload EPC certificate')
    //             } else {
    //                 keuringForm.epc_certificaten.push({
    //                     naam: file.name,
    //                     size: file.size,
    //                     type: TypeKeuring.EPC
    //                 })
    //             }
    //         } else {
    //             const { error } = await supabase.storage.from('certificaten').upload(`Asbest/${file.name}`, file)
    //             if (error) {
    //                 console.log('Could not upload Asbest certificate')
    //             } else {
    //                 keuringForm.asbest_certificaten.push({
    //                     naam: file.name,
    //                     size: file.size,
    //                     type: TypeKeuring.ASBEST
    //                 })
    //             }
    //         }
    //     }
    // }
}

const removeCertificaat = async (event: Event, index: number, typeKeuring: TypeKeuring) => {
    event.preventDefault()

    // if (typeKeuring === TypeKeuring.EPC) {
    //     const { error } = await supabase.storage.from('certificaten').remove([`EPC/${keuringForm.epc_certificaten[index].naam}`])
    //     if (error) {
    //         console.error(`Unable to remove ${keuringForm.epc_certificaten[index].naam} from the storage`)
    //     } else {
    //         keuringForm.epc_certificaten = keuringForm.epc_certificaten.filter((certificaat, i) => i !== index)
    //     }
    // } else {
    //     const { error } = await supabase.storage.from('certificaten').remove([`Asbest/${keuringForm.asbest_certificaten[index].naam}`])
    //     if (error) {
    //         console.error(`Unable to remove ${keuringForm.asbest_certificaten[index].naam} from the storage`)
    //     } else {
    //         keuringForm.asbest_certificaten = keuringForm.asbest_certificaten.filter((certificaat, i) => i !== index)
    //     }
    // }
}

const uploadExtraDocumenten = async (event: Event) => {
    // const { files } = event.target as HTMLInputElement

    // if (files) {
    //     for (const file of files) {
    //         const { error } = await supabase.storage.from('extra-documenten').upload(`/${keuringForm.straatnaam}-${keuringForm.nummer}/${file.name}`, file)
    //         if (error) {
    //             console.error('Could not upload document')
    //         } else {
    //             keuringForm.extra_documenten.push({
    //                 naam: file.name,
    //                 size: file.size,
    //                 type: file.type
    //             })
    //         }
    //     }
    // }
}

const removeDocument = async (event: Event, index: number) => {
    // event.preventDefault()

    // const { error } = await supabase.storage.from('extra-documenten').remove([`${keuringForm.extra_documenten[index].naam}`])
    // if (error) {
    //     console.error(`Unable to remove ${keuringForm.extra_documenten[index].naam} from the storage`)
    // } else {
    //     keuringForm.extra_documenten = keuringForm.extra_documenten.filter((document, i) => i !== index)
    // }
}

const handleChangeFacturatieBestemming = (event: Event) => {
    // event.preventDefault()
    // const e = event.target as HTMLInputElement;

    // if (e.value !== "Anders") {
    //     keuringForm.facturatie.voornaam = ""
    //     keuringForm.facturatie.achternaam = ""
    //     keuringForm.facturatie.emailadres = ""
    //     keuringForm.facturatie.telefoonnummer = ""
    //     keuringForm.facturatie.straatnaam = ""
    //     keuringForm.facturatie.nummer = ""
    //     keuringForm.facturatie.vlaamse_stad = {
    //         gemeente: "",
    //         provincie: "",
    //         stad: ""
    //     }
    // } else {
    //     copyClientData(keuringForm)
    // }
}

const submitForm = (event: Event) => {
    event.preventDefault()
    console.log(route.params.id)
    updateKeuring()
}

const updateKeuring = async () => {
    // const {data: updatedCertificate} = await supabase.from('certificaten').update({
    //     name: keuring
    // }).eq("keuringID", route.params.id as string)

    const { data: updatedKeuring } = await supabase.from('keuringen').update({
        datum_plaatsbezoek: keuringForm.datum_plaatsbezoek,
        adres_ID: keuringForm.adresID,
        status: keuringForm.status,
        type: keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST) ? keuringForm.type.join("/") : keuringForm.type[0],
        opmerking: keuringForm.opmerking,
        toegang_eenheid: keuringForm.toegang_eenheid,
        created_by: keuringForm.created_by.id,
        klant_ID: keuringForm.klantID,
        facturatie_ID: keuringForm.facturatieID,
        facturatie_bestemming: keuringForm.facturatie_bestemming,
    }).eq('id', route.params.id)

}

const selectAddress = (id: string) => {
    keuringForm.adresID = id;
}

const selectClient = (id: string) => {
    keuringForm.klantID = id;
}

const selectFacturatie = (id: string) => {
    keuringForm.facturatieID = id;
}

const handleClick = () => {
    certificatenStore.$reset;
    extraDocumentenStore.$reset;
    router.push('/keuringen')
}

onBeforeMount(async () => {
    try {
        const { data } = await
            supabase
                .from('keuringen')
                .select("*")
                .eq('id', route.params.id)
                .single()

        if (data) {
            keuringForm.type = [...(data.type.split('/').map((value: TypeKeuring) => value.trim()))]
            keuringForm.toegang_eenheid = data.toegang_eenheid
            keuringForm.klantID = data.klant_ID
            keuringForm.adresID = data.adres_ID
            keuringForm.facturatieID = data.facturatie_ID
            keuringForm.facturatie_bestemming = data.facturatie_bestemming
            keuringForm.opmerking = data.opmerking
            keuringForm.datum_plaatsbezoek = data.datum_plaatsbezoek
            keuringForm.status = data.status
        }
    } finally {
        loadingKeuring.value = false;
    }
})

onMounted(() => {
    const t1 = gsap.timeline({ repeat: -1, defaults: { duration: 0.3 } });

    t1.set('.loading p span', { opacity: 0 })

    t1.to('.loading p span:nth-child(1)', { opacity: 1 });
    t1.to('.loading p span:nth-child(2)', { opacity: 1 });
    t1.to('.loading p span:nth-child(3)', { opacity: 1 });

    t1.to('.loading p span', { opacity: 0 });

    t1.play()
})
</script>

<template>
    <div class="container edit-keuring">
        <div class="title">
            <span class="back-btn" @click="handleClick">
                <Icon icon="mdi:arrow-left" width="30" />
            </span>
            <h1>Keuring wijzigen</h1>
        </div>
        <form @submit="submitForm" v-if="!loadingKeuring">
            <div class="keuring">
                <div class="type">
                    <span class="cb-epc">
                        <Checkbox v-model="keuringForm.type" inputId="tkEpc" :value="TypeKeuring.EPC" />
                        <label for="tkEpc" class="ml-2">{{ TypeKeuring.EPC }}</label>
                    </span>
                    <span class="cb-asbest">
                        <Checkbox v-model="keuringForm.type" inputId="tkAsbest" :value="TypeKeuring.ASBEST" />
                        <label for="tkAsbest" class="ml-2">{{ TypeKeuring.ASBEST }}</label>
                    </span>
                </div>
                <div class="toegang-eenheid">
                    <span class="rb-klant">
                        <RadioButton v-model="keuringForm.toegang_eenheid" input-id="teKlant"
                            :value="ToegangEenheid.KLANT" />
                        <label for="teKlant">Afspreken met klant</label>
                    </span>
                    <span class="rb-sleutels">
                        <RadioButton v-model="keuringForm.toegang_eenheid" input-id="teSleutels"
                            :value="ToegangEenheid.SLEUTELS" />
                        <label for="teSleutels">Sleutels ophalen</label>
                    </span>
                </div>
                <div v-if="keuringAddress" class="adres-wrapper">
                    <div class="data-row">
                        <div class="adres">
                            {{ `${keuringAddress.straatnaam} ${keuringAddress.nummer},
                                                        ${keuringAddress.vlaamse_stad.postcode}
                                                        ${keuringAddress.vlaamse_stad.gemeente}` }}
                        </div>
                        <div @click="keuringForm.adresID = ''">
                            <Icon icon="mdi:close" width="20" />
                        </div>
                    </div>
                </div>
                <div v-else class="adres-error">
                    <div class="data-row">
                        <div class="adres">
                            Geen adres geselecteerd
                        </div>
                    </div>
                </div>
                <div v-if="keuringClient" class="klant-wrapper">
                    <div class="data-row">
                        <div>
                            <div class="name">
                                {{ `${keuringClient.voornaam} ${keuringClient.achternaam}` }}
                            </div>
                            <div class="email-tel">
                                @{{ `${keuringClient.emailadres} -
                                                                ${keuringClient.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` }}
                            </div>
                        </div>
                        <div
                            @click="keuringForm.klantID = ''; keuringForm.facturatieID = ''; keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE">
                            <Icon icon="mdi:close" width="20" />
                        </div>
                    </div>
                </div>
                <div v-else class="klant-error">
                    <div class="data-row">
                        <div class="name">
                            Geen klant geselecteerd
                        </div>
                    </div>
                </div>
                <div class="facturatie-wrapper">
                    <h3>Facturatie</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="data-row">
                            <div class="rbs-bestemming">
                                <span class="rb-hetzelfde">
                                    <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_hetzelfde"
                                        :value="FacturatieBestemming.HETZELFDE"
                                        @change="handleChangeFacturatieBestemming" />
                                    <label for="fac_hetzelfde" class="ml-2">Klant</label>
                                </span>
                                <span class="rb-immo">
                                    <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_immo"
                                        :value="FacturatieBestemming.IMMO" @change="handleChangeFacturatieBestemming" />
                                    <label for="fac_immo" class="ml-2">Immo</label>
                                </span>
                                <span class="rb-anders" v-if="keuringClient">
                                    <RadioButton v-model="keuringForm.facturatie_bestemming" inputId="fac_anders"
                                        :value="FacturatieBestemming.ANDERS" @change="handleChangeFacturatieBestemming" />
                                    <label for="fac_anders" class="ml-2">Anders</label>
                                </span>
                            </div>
                            <div v-if="keuringForm.facturatie_bestemming !== FacturatieBestemming.HETZELFDE"
                                @click="keuringForm.facturatieID = ''; keuringForm.facturatie_bestemming = FacturatieBestemming.HETZELFDE">
                                <Icon icon="mdi:close" width="20" />
                            </div>
                        </div>
                        <div v-if="keuringForm.facturatie_bestemming === FacturatieBestemming.ANDERS"
                            style="padding-left: 2rem;">
                            <div v-if="keuringFacturatie" class="fac_name">
                                {{ `${keuringFacturatie.voornaam} ${keuringFacturatie.achternaam}` }}
                            </div>
                            <div v-if="keuringFacturatie" class="fac_email-tel">
                                {{ `${keuringFacturatie.emailadres} - ${keuringFacturatie.telefoonnummer}` }}
                            </div>
                            <div v-if="keuringFacturatie" class="fac_adres">
                                {{ `${keuringFacturatie.straatnaam} ${keuringAddress?.nummer},
                                                                ${keuringAddress?.vlaamse_stad.gemeente}` }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="opmerking">
                    <div>
                        <Textarea v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
                    </div>
                </div>
                <div class="datum-plaatsbezoek-wrapper">
                    <h3>Datum Plaatsbezoek</h3>
                    <VueDatePicker v-model="keuringForm.datum_plaatsbezoek" :min-date="new Date()"
                        @update:model-value="handleDate" @cleared="handleDateClear" preview-format="dd/MM/yyyy HH:mm"
                        format="dd/MM/yyyy HH:mm" :min-time="{ hours: 7, minutes: 0 }" :max-time="{ hours: 19, minutes: 0 }"
                        locale="nl" cancel-text="Sluiten" select-text="Selecteer" />
                </div>
                <div class="uploader-wrapper">
                    <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="warning"
                        @click="certificatesFormVisible = !certificatesFormVisible; extraDocsFormVisible = false">
                        <span class="text">
                            <Icon icon="mdi:certificate" width="20" />
                            Certificaten
                        </span>
                        <span v-if="keuringForm.type.length">
                            <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                                {{ keuringForm.epc_certificaten.length }}
                            </span>
                            <span class="amount"
                                v-if="keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)">
                                |
                            </span>
                            <span class="amount" v-if="keuringForm.type.includes(TypeKeuring.ASBEST)">
                                {{ keuringForm.asbest_certificaten.length }}
                            </span>
                        </span>
                    </Button>
                    <Button :disabled="!keuringForm.adresID || !keuringForm.klantID" raised severity="info"
                        @click="extraDocsFormVisible = !extraDocsFormVisible; certificatesFormVisible = false">
                        <span class="text">
                            <Icon icon="mdi:file-document" width="20" />
                            Extra documenten
                        </span>
                        <span class="amount">({{ keuringForm.extra_documenten.length }})</span>
                    </Button>
                </div>
            </div>
            <div class="actions">
                <ul>
                    <li title="Keuring uploaden">
                        <button type="submit" style="background-color: seagreen;">
                            <Icon icon="mdi:send" width="22" color="white" />
                        </button>
                    </li>
                    <li title="Annuleren" @click="confirmCancelFormDialog = true">
                        <button type="button" style="background-color: crimson;">
                            <Icon icon="mdi:close" width="22" color="white" />
                        </button>
                    </li>
                    <Dialog class="dialog" v-model:visible="confirmCancelFormDialog" modal header="Annuleren bevestigen">
                        <p>
                            Weet je zeker dat je het formulier wilt annuleren? Eventuele onopgeslagen wijzigingen zullen
                            verloren gaan.
                        </p>
                        <Button severity="danger" label="Annuleren" @click="router.push('/keuringen')" />
                    </Dialog>
                </ul>
            </div>
            <div class="sub-form">
                <WEVAddressForm v-if="!keuringForm.adresID" :form="keuringForm" @select-address="selectAddress" />
                <WEVClientForm v-if="keuringForm.adresID && !keuringForm.klantID" :form="keuringForm"
                    @select-client="selectClient" />
                <WEVFacturatieForm @select-facturatie="selectFacturatie"
                    v-if="keuringForm.facturatie_bestemming === FacturatieBestemming.ANDERS && !keuringForm.facturatieID"
                    :keuringClient="keuringClient" :keuringAddress="keuringAddress" :form="keuringForm"
                    :klanten="klantenStore.klanten" :adressen="adressenStore.adressen" />
                <!-- <WEVExtraDocsForm v-if="extraDocsFormVisible" :form="keuringForm"
                    @uploadExtraDocumenten="(event) => uploadExtraDocumenten(event)"
                    @removeDocument="(event, i) => removeDocument(event, i)" /> -->
                <!-- <WEVCertificatesForm v-if="certificatesFormVisible && keuringForm.klantID && keuringForm.adresID"
                    :form="keuringForm"
                    @uploadCertificaten="(event, type, keuring) => uploadCertificaat(event, type, keuring)"
                    @removeCertificaat="(event, i, type) => removeCertificaat(event, i, type)" /> -->
            </div>
        </form>
        <div class="loading" v-else>
            <p>Keuring aan het laden<span>.</span><span>.</span><span>.</span></p>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.loading {
    p {
        font-size: 1.4rem;
    }
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
            background-color: #e2e8f0;
        }
    }
}

.edit-keuring {
    font-family: 'Rubik', sans-serif;
    margin-bottom: 5rem;

    form {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .actions {
        width: 60px;

        ul {
            flex: 1;
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            li {
                display: flex;
                align-items: center;

                button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 34px;
                    height: 34px;
                    border-radius: 15%;
                    border: none;
                    cursor: pointer;
                }
            }
        }
    }

    .sub-form {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        flex: 1;
    }

    .keuring {
        width: 475px;
        display: flex;
        flex-direction: column;
        padding: 4.5rem;
        box-shadow:
            0 0 58px 0 rgba(0, 0, 0, 0.18),
            0 0 14px 0 rgba(0, 0, 0, 0.18);
        gap: 3rem;

        label,
        textarea,
        .adres,
        .name {
            font-size: 1.4rem;
        }

        .adres,
        .klant,
        .name,
        .fac_name,
        .fac_adres {
            font-weight: 600;
        }

        .fac_adres {
            margin-top: 0.5rem;
        }

        .email-tel {
            padding-top: 0.25rem;
        }

        .type {
            display: flex;
            gap: 20px;

            .cb-epc,
            .cb-asbest {
                display: flex;
                align-items: center;
                accent-color: seagreen;

                label {
                    margin-left: 1rem;
                }
            }
        }

        .toegang-eenheid {
            display: flex;
            gap: 20px;

            div {
                display: flex;
                gap: 1rem;
            }

            .rb-klant,
            .rb-sleutels {
                display: flex;
                align-items: center;
                accent-color: seagreen;

                label {
                    // font-size: 1.4rem;
                    margin-left: 1rem;
                }

                input {
                    margin: 0;
                }
            }
        }

        .opmerking,
        .adres-wrapper,
        .adres-error,
        .klant-error,
        .klant-wrapper,
        .facturatie-wrapper {
            display: flex;
            justify-content: space-between;
            padding-left: 1rem;
        }

        .opmerking,
        .adres-wrapper,
        .klant-wrapper,
        .facturatie-wrapper {
            border-left: 2px solid seagreen;
        }

        .adres-error,
        .klant-error {
            border-left: 2px solid crimson;
            color: crimson;
        }

        .uploader-wrapper {
            display: flex;
            gap: 1rem;

            button {
                flex: 1;
                display: flex;
                // gap: 1rem;
                font-weight: bold;

                .text {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }
            }
        }

        .opmerking {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;

            textarea {
                display: block;
                font-family: 'Rubik', sans-serif;
                padding: 1rem;
                resize: none;
                width: 100%;
                height: 100px;
            }
        }

        .facturatie-wrapper {
            flex-direction: column;
            gap: 1.5rem;

            >div {
                padding-left: 0.5rem;
            }

            .rbs-bestemming {
                display: flex;
                flex-direction: row;
                gap: 20px;

                .rb-hetzelfde,
                .rb-immo,
                .rb-anders {
                    display: flex;
                    accent-color: seagreen;

                    label {
                        display: flex;
                        align-items: center;
                        margin-left: 1rem;
                    }
                }
            }
        }

        .datum-plaatsbezoek-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .data-row {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            div {
                display: flex;
                flex-direction: column;
            }
        }
    }

    .datum-plaatsbezoek {
        display: flex;
        gap: 20px;

        >div {
            flex: 1;
            border-left: solid 1px #0000006c;
            padding-left: 20px;
        }
    }

    :deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
        padding: 0.75rem 1.25rem;
    }
}
</style>