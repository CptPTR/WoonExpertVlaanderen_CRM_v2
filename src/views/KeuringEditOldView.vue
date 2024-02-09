<script setup lang="ts">
import { supabase } from '@/config/supabase';
import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming';
import type { Rol } from '@/enums/modules/Rol';
import { Status } from '@/enums/modules/Status';
import { ToegangEenheid } from '@/enums/modules/ToegangEenheid';
import { TypeKeuring } from '@/enums/modules/TypeKeuring';
import { useAuthStore } from '@/stores/authStore';
import { useCertificaatStore } from '@/stores/certificatenStore';
import { useKeuringenStore } from '@/stores/keuringenStore';
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore';
import type { FormKeuring } from '@/types';
import { formatFileSize } from '@/utils/formatting';
import { Icon } from '@iconify/vue';
import Checkbox from "primevue/checkbox";
import RadioButton from 'primevue/radiobutton';
import { onMounted, reactive } from "vue";
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore()
const keuringenStore = useKeuringenStore()
const vlaamseStedenStore = useVlaamseStedenStore()
const certificatenStore = useCertificaatStore()
const router = useRouter()
const route = useRoute()

const keuringForm: FormKeuring = reactive({
    type: [],
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
        provincie: ''
    },
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
        }
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
            provincie: ""
        }
    }
})

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
    console.log(keuringForm)
    updateKeuring()
}

const updateKeuring = async () => {
    const { data } = await supabase.from('keuringen').update({
        status: keuringForm.status,
        type: keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST) ? keuringForm.type.join("/") : keuringForm.type[0],
        opmerking: keuringForm.opmerking,
        toegang_eenheid: keuringForm.toegang_eenheid,
    }).eq('id', route.params.id as string).select().single()

}

onMounted(async () => {
    const { data, error } = await
        supabase
            .from('keuringen')
            .select('*, klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*)), gebruikers: created_by(*, organisatie: organisaties(*))')
            .eq('id', route.params.id)
            .single()

    if (data) {
        keuringForm.voornaam = data.klant.voornaam
        keuringForm.familienaam = data.klant.achternaam
        keuringForm.emailadres = data.klant.emailadres
        keuringForm.telefoonnummer = data.klant.telefoonnummer
        keuringForm.straatnaam = data.adres.straatnaam
        keuringForm.nummer = data.adres.nummer
        keuringForm.vlaamse_stad = {
            gemeente: data.adres.vlaamse_stad.gemeente,
            stad: data.adres.vlaamse_stad.stad,
            provincie: data.adres.vlaamse_stad.provincie,
        }
        keuringForm.opmerking = data.opmerking
        keuringForm.toegang_eenheid = data.toegang_eenheid
        keuringForm.type.push(...(data.type.split('/').map((value: TypeKeuring) => value.trim())))
        keuringForm.datum_plaatsbezoek = data.datum_plaatsbezoek
    }
})
</script>

<template>
    <div class="container edit-keuring">
        <div class="title">
            <span class="back-btn" @click="router.back()">
                <Icon icon="mdi:arrow-left" width="30" />
            </span>
            <h1>Keuring aanpassen</h1>
        </div>
        <form class="content" @submit="submitForm">
            <div class="column">
                <div class="type">
                    <h2>Type</h2>
                    <div>
                        <span class="cb-epc">
                            <Checkbox v-model="keuringForm.type" inputId="tkEpc" :value="TypeKeuring.EPC" />
                            <label for="tkEpc">EPC</label>
                        </span>
                        <span class="cb-asbest">
                            <Checkbox v-model="keuringForm.type" inputId="tkAsbest" :value="TypeKeuring.ASBEST" />
                            <label for="tkAsbest">Asbest</label>
                        </span>
                    </div>
                </div>
                <div class="klant">
                    <h2>Klant</h2>
                    <div>
                        <ul>
                            <li>
                                <Icon icon="mdi:account" width="24" />
                                <input type="text" placeholder="Voornaam" id="voornaam" name="voornaam" required
                                    v-model="keuringForm.voornaam" />
                            </li>
                            <li>
                                <Icon icon="" width="24" />
                                <input type="text" placeholder="Familienaam" id="familienaam" name="familienaam" required
                                    v-model="keuringForm.familienaam" />
                            </li>
                            <li>
                                <Icon icon="mdi:at" width="24" />
                                <input type="email" placeholder="Emailadres" id="emailadres" name="emailadres" required
                                    v-model="keuringForm.emailadres" />
                            </li>
                            <li>
                                <Icon icon="mdi:phone" width="24" />
                                <input type="tel" placeholder="Telefoonnummer" id="telefoonnummer" name="telefoonnummer"
                                    required pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}"
                                    v-model="keuringForm.telefoonnummer" />
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="adres">
                    <h2>Adres</h2>
                    <div>
                        <ul>
                            <li>
                                <Icon icon="mdi:home" width="24" />
                                <input type="text" name="straatnaam" id="straatnaam" placeholder="Straat"
                                    v-model="keuringForm.straatnaam" />
                                <input type="text" name="nummer" id="nummer" placeholder="Nr" maxlength="10"
                                    v-model="keuringForm.nummer" />
                            </li>
                            <li>
                                <Icon icon="mdi:city" width="24" />
                                <input list="gemeenteLijst" id="gemeente" name="gemeente" placeholder="Gemeente" required
                                    title="Selecteer een gemeente" v-model="keuringForm.vlaamse_stad.gemeente" />
                                <datalist id="gemeenteLijst">
                                    <option v-for="vlaamseStad in vlaamseStedenStore.vlaamse_steden" :key="vlaamseStad.id"
                                        :value="vlaamseStad.gemeente"></option>
                                </datalist>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="facturatie">
                    <h2>Facturatie</h2>
                    <div>
                        <div class="rbs-bestemming">
                            <span class="rb-hetzelfde">
                                <RadioButton v-model="keuringForm.facturatie.bestemming" inputId="fac_hetzelfde"
                                    :value="FacturatieBestemming.HETZELFDE" @change="handleChangeFacturatieBestemming" />
                                <!-- <input type="radio" name="bestemming" id="fac_hetzelfde" value="Hetzelfde"
                                    v-model="keuringForm.facturatie.bestemming" @change="handleChangeFacturatieBestemming"
                                    checked /> -->
                                <label for="fac_hetzelfde">Klant</label>
                            </span>
                            <span class="rb-immo">
                                <RadioButton v-model="keuringForm.facturatie.bestemming" inputId="fac_immo"
                                    :value="FacturatieBestemming.IMMO" @change="handleChangeFacturatieBestemming" />
                                <!-- <input type="radio" name="bestemming" id="fac_immo" value="Immo"
                                    v-model="keuringForm.facturatie.bestemming"
                                    @change="handleChangeFacturatieBestemming" /> -->
                                <label for="fac_immo">Immo</label>
                            </span>
                            <span class="rb-anders">
                                <RadioButton v-model="keuringForm.facturatie.bestemming" inputId="fac_anders"
                                    :value="FacturatieBestemming.ANDERS" @change="handleChangeFacturatieBestemming" />
                                <!-- <input type="radio" name="bestemming" id="fac_anders" value="Anders"
                                    v-model="keuringForm.facturatie.bestemming" @change="handleChangeFacturatieBestemming"> -->
                                <!-- @change="$event => copyClientData($event, keuringForm)" -->
                                <label for="fac_anders">Anders</label>
                            </span>
                        </div>
                        <ul
                            v-if="keuringForm.facturatie.bestemming === FacturatieBestemming.ANDERS && keuringForm.facturatie">
                            <li>
                                <input type="text" placeholder="Voornaam" id="fac_voornaam" required
                                    v-model="keuringForm.facturatie.voornaam" />
                            </li>
                            <li>
                                <input type="text" placeholder="Familienaam" id="fac_familienaam" required
                                    v-model="keuringForm.facturatie.achternaam" />
                            </li>
                            <li>
                                <input type="email" placeholder="Emailadres" id="fac_emailadres" required
                                    v-model="keuringForm.facturatie.emailadres" />
                            </li>
                            <li>
                                <input type="tel" placeholder="Telefoonnummer" id="fac_telefoonnummer" required
                                    pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}"
                                    v-model="keuringForm.facturatie.telefoonnummer" />
                            </li>
                            <li>
                                <input type="text" id="fac_straatnaam" placeholder="Straat"
                                    v-model="keuringForm.straatnaam" />
                                <input type="text" id="fac_nummer" placeholder="Nr" maxlength="10"
                                    v-model="keuringForm.facturatie.nummer" />
                            </li>
                            <li v-if="keuringForm.facturatie.vlaamse_stad">
                                <input list="gemeenteLijst" id="fac_gemeente" placeholder="Gemeente" required
                                    title="Selecteer een gemeente" v-model="keuringForm.facturatie.vlaamse_stad.gemeente" />
                                <datalist id="gemeenteLijst">
                                    <option v-for="vlaamseStad in vlaamseStedenStore.vlaamse_steden" :key="vlaamseStad.id"
                                        :value="vlaamseStad.gemeente"></option>
                                </datalist>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="certificaten">
                    <h2>Certificaten</h2>
                    <div class="epc-asbest">
                        <div class="epc" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                            <div class="uploader-wrapper">
                                <input class="hidden" type="file" name="epcCertificaat" id="epcCertificaat" multiple
                                    @change="($event) => uploadCertificaat($event, TypeKeuring.EPC)" accept=".pdf" />
                                <label for="epcCertificaat"> EPC Certificaat uploaden </label>
                                <ul v-if="keuringForm.epc_certificaten.length > 0">
                                    <li v-for="(certificaat, index) in keuringForm.epc_certificaten"
                                        :key="certificaat.naam">
                                        <p>
                                            <span class="naam" :title="certificaat.naam">
                                                {{ certificaat.naam }}
                                            </span>
                                            <span class="size">
                                                {{ formatFileSize(certificaat.size) }}
                                            </span>
                                        </p>
                                        <button @click="($event) => removeCertificaat($event, index, TypeKeuring.EPC)">
                                            <Icon icon="mdi:delete" width="16" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="asbest" v-if="keuringForm.type.includes(TypeKeuring.ASBEST)">
                            <div class="uploader-wrapper">
                                <input class="hidden" type="file" name="asbestCertificaat" id="asbestCertificaat" multiple
                                    @change="($event) => uploadCertificaat($event, TypeKeuring.ASBEST)" accept=".pdf" />
                                <label for="asbestCertificaat"> Asbest Certificaat uploaden </label>
                                <ul v-if="keuringForm.asbest_certificaten.length > 0">
                                    <li v-for="(certificaat, index) in keuringForm.asbest_certificaten"
                                        :key="certificaat.naam">
                                        <p>
                                            <span class="naam" :title="certificaat.naam">
                                                {{ certificaat.naam }}
                                            </span>
                                            <span class="size">
                                                {{ formatFileSize(certificaat.size) }}
                                            </span>
                                        </p>
                                        <button @click="($event) => removeCertificaat($event, index, TypeKeuring.ASBEST)">
                                            <Icon icon="mdi:delete" width="16" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div
                            v-if="!keuringForm.type.includes(TypeKeuring.EPC) && !keuringForm.type.includes(TypeKeuring.ASBEST)">
                            <p>Selecteer type keuring om een certificaat te uploaden</p>
                        </div>
                    </div>
                </div>
                <div class="toegang-eenheid">
                    <h2>Toegang eenheid</h2>
                    <div>
                        <span class="rb-klant">
                            <RadioButton v-model="keuringForm.toegang_eenheid" inputId="teKlant"
                                :value="ToegangEenheid.KLANT" />
                            <label for="teKlant">Afspreken met klant</label>
                        </span>
                        <span class="rb-sleutels">
                            <RadioButton v-model="keuringForm.toegang_eenheid" inputId="teSleutels"
                                :value="ToegangEenheid.SLEUTELS" />
                            <label for="teSleutels">Sleutels ophalen</label>
                        </span>
                    </div>
                </div>
                <div class="datum-plaatsbezoek">
                    <h2>Datum Plaatsbezoek</h2>
                    <div>
                        <VueDatePicker v-model="keuringForm.datum_plaatsbezoek" :min-date="new Date()"
                            :min-time="{ hours: 7, minutes: 0 }" :max-time="{ hours: 19, minutes: 0 }" locale="nl"
                            cancel-text="Sluiten" select-text="Selecteer" />
                    </div>
                </div>
                <div class="opmerking">
                    <h2>Opmerkingen</h2>
                    <div>
                        <textarea name="opmerkingen" id="opmerkingen" placeholder="Opmerkingen"
                            v-model="keuringForm.opmerking"></textarea>
                    </div>
                </div>
                <div class="extradocs">
                    <h2>
                        Extra <br />
                        documenten
                    </h2>
                    <div class="uploader-wrapper">
                        <input class="hidden" type="file" name="extraDocumenten" id="extraDocumenten" multiple
                            @change="uploadExtraDocumenten" />
                        <label for="extraDocumenten"> Extra documenten uploaden </label>
                        <ul v-if="keuringForm.extra_documenten.length > 0">
                            <li v-for="(document, index) in keuringForm.extra_documenten" :key="document.naam">
                                <p>
                                    <span class="naam" :title="document.naam">
                                        {{ document.naam }}
                                    </span>
                                    <span class="size">
                                        {{ formatFileSize(document.size) }}
                                    </span>
                                </p>
                                <button @click="($event) => removeDocument($event, index)">
                                    <Icon icon="mdi:delete" width="16" />
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="acties">
                    <input type="button" value="Annuleren" class="cancel" @click="router.replace('/keuringen')" />
                    <input type="submit" value="Aanpassen" class="confirm" />
                </div>
            </div>
        </form>
    </div>
</template>


<style lang="scss" scoped>
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

    .content {
        display: flex;
        flex-wrap: wrap;
        gap: 40px;
        margin-top: 10px;
        position: relative;
        padding: 60px 60px;
        box-shadow:
            0 26px 58px 0 rgba(0, 0, 0, 0.22),
            0 5px 14px 0 rgba(0, 0, 0, 0.18);

        .column {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 50px;

            .type {
                display: flex;
                gap: 20px;

                >div {
                    display: flex;
                    gap: 20px;
                    border-left: solid 1px #0000006c;
                    padding-left: 20px;

                    .cb-epc,
                    .cb-asbest {
                        display: flex;
                        align-items: center;
                        accent-color: seagreen;

                        label {
                            font-size: 1.4rem;
                            margin-left: 1rem;
                        }
                    }
                }
            }

            .klant,
            .adres {
                display: flex;
                gap: 20px;

                >div {
                    border-left: solid 1px #0000006c;

                    ul {
                        list-style: none;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        padding-left: 1.5rem;

                        li {
                            display: flex;
                            align-items: center;

                            input {
                                padding: 0.75rem;
                                margin-left: 1rem;
                                font-size: 1.4rem;
                                border: solid 1px rgb(226, 232, 240);
                            }
                        }
                    }

                    input[id='nummer'] {
                        width: 100px;
                    }
                }
            }

            .facturatie {
                display: flex;
                gap: 20px;

                >div {
                    border-left: solid 1px #0000006c;

                    ul {
                        list-style: none;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        padding-left: 1.5rem;
                        margin-top: 2rem;

                        li {
                            display: flex;
                            align-items: center;

                            input {
                                padding: 0.75rem;
                                margin-left: 1rem;
                                font-size: 1.4rem;
                                border: solid 1px rgb(226, 232, 240);
                            }
                        }
                    }

                    input[id='fac_nummer'] {
                        width: 100px;
                    }

                    .rbs-bestemming {
                        display: flex;
                        gap: 20px;
                        padding-left: 20px;

                        .rb-hetzelfde,
                        .rb-immo,
                        .rb-anders {
                            display: flex;
                            align-items: center;
                            accent-color: seagreen;

                            label {
                                font-size: 1.4rem;
                                margin-left: 1rem;
                            }
                        }
                    }
                }
            }

            .toegang-eenheid {
                display: flex;
                gap: 20px;

                >div {
                    display: flex;
                    gap: 20px;
                    border-left: solid 1px #0000006c;
                    padding-left: 20px;

                    .rb-klant,
                    .rb-sleutels {
                        display: flex;
                        align-items: center;
                        accent-color: seagreen;

                        label {
                            font-size: 1.4rem;
                            margin-left: 1rem;
                        }
                    }
                }
            }

            .certificaten {
                display: flex;
                gap: 20px;

                .epc-asbest {
                    flex: 1;
                    border-left: solid 1px #0000006c;
                    padding-left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;

                    ul {
                        margin-top: 1rem;
                    }

                    .epc,
                    .asbest {
                        flex: 1;
                        overflow: hidden;
                        display: flex;

                        input {
                            font-size: 1.4rem;
                        }

                        &>* {
                            display: flex;
                            justify-content: space-between;
                        }
                    }

                    p {
                        font-size: 1.4rem;
                    }
                }
            }

            .extradocs {
                display: flex;
                gap: 20px;

                >div {
                    flex: 1;
                    border-left: solid 1px #0000006c;
                    padding-left: 20px;

                    ul {
                        list-style: none;
                        max-height: 150px;
                        overflow-y: auto;
                        margin-block: 1rem;


                        li {
                            display: flex;
                            justify-content: space-between;
                            font-size: 1.4rem;
                            margin-block: 1rem;
                        }
                    }
                }
            }

            .opmerking {
                display: flex;
                gap: 20px;

                >div {
                    flex: 1;
                    border-left: solid 1px #0000006c;
                    padding-left: 20px;

                    textarea {
                        display: block;
                        font-family: 'Rubik', sans-serif;
                        font-size: 1.4rem;
                        padding: 1rem;
                        resize: none;
                        width: 100%;
                        height: 100px;
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
        }

        .acties {
            margin-top: auto;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            gap: 10px;

            .cancel,
            .confirm {
                height: 40px;
                color: #fff;
                padding-inline: 1.4rem;
                font-size: 1.4rem;
                font-family: 'Rubik', sans-serif;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .cancel {
                background-color: tomato;
            }

            .confirm {
                background-color: seagreen;
            }
        }

        .uploader-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;

            label {
                font-size: 1.4rem;
                padding: 1rem;
                background-color: #e2e8f0;
                border: 2px dashed;
                cursor: cell;
            }

            ul {
                list-style: none;
                max-height: 100px;
                overflow-y: auto;
                margin-block: 1rem;

                li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 1.4rem;
                    margin-block: 1rem;

                    p {
                        flex: 1;
                        display: flex;
                        justify-content: space-between;

                        span {
                            font-size: 1.2rem;
                            overflow-x: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }

                        .naam {
                            width: 175px;
                        }
                    }

                    button {
                        margin-left: 1rem;
                    }
                }
            }
        }
    }
}
</style>