<script lang="ts" setup>
import { supabase } from '@/config/supabase'
import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
import type { Rol } from '@/enums/modules/Rol'
import { Status } from '@/enums/modules/Status'
import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
import { TypeKeuring } from '@/enums/modules/TypeKeuring'
import { useAuthStore } from '@/stores/authStore'
import { useCertificaatStore } from '@/stores/certificatenStore'
import { useKeuringStore } from '@/stores/keuringenStore'
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
import type { Adres, FormKeuring, Keuring, Klant } from '@/types'
import { copyClientData } from '@/utils/copyData'
import { formatFileSize } from '@/utils/formatting'
import { Icon } from '@iconify/vue'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import { onBeforeMount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const keuringenStore = useKeuringStore()
const vlaamseStedenStore = useVlaamseStedenStore()
const certificatenStore = useCertificaatStore()
const router = useRouter()

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
        id: authStore.currentlLoggedIn?.id as string,
        voornaam: authStore.currentlLoggedIn?.voornaam as string,
        achternaam: authStore.currentlLoggedIn?.achternaam as string,
        email: authStore.currentlLoggedIn?.email as string,
        telefoonnummer: authStore.currentlLoggedIn?.telefoonnummer as string,
        rol: authStore.currentlLoggedIn?.rol as Rol,
        specialisatie: authStore.currentlLoggedIn?.specialisatie as TypeKeuring,
        organisatie: {
            naam: authStore.currentlLoggedIn?.organisatie.naam as string
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

const adressen = ref<Adres[]>([])

const getAdressenData = async () => {
    const { data } = await supabase.from('adressen').select('*, vlaamse_stad: vlaamse_steden(*)')

    if (data) {
        data.map((adres) => {
            adressen.value.push({
                id: adres.id,
                straatnaam: adres.straatnaam,
                nummer: adres.nummer,
                vlaamse_stad: {
                    id: adres.vlaamse_stad.id,
                    gemeente: adres.vlaamse_stad.gemeente,
                    stad: adres.vlaamse_stad.stad,
                    provincie: adres.vlaamse_stad.provincie,
                }
            })
        })
    }
}


const uploadExtraDocumenten = async (event: Event) => {
    const { files } = event.target as HTMLInputElement

    if (files) {
        for (const file of files) {
            const { error } = await supabase.storage.from('extra-documenten').upload(`/${file.name}`, file)
            if (error) {
                console.error('Could not upload document')
            } else {
                keuringForm.extra_documenten.push({
                    naam: file.name,
                    size: file.size,
                    type: file.type
                })
            }
        }
    }
}

const uploadCertificaat = async (event: Event, typeKeuring: TypeKeuring) => {
    const { files } = event.target as HTMLInputElement

    if (files) {
        for (const file of files) {
            if (typeKeuring === TypeKeuring.EPC) {
                const { error } = await supabase.storage.from('certificaten').upload(`EPC/${file.name}`, file)
                if (error) {
                    console.log('Could not upload EPC certificate')
                } else {
                    keuringForm.epc_certificaten.push({
                        naam: file.name,
                        size: file.size,
                        type: TypeKeuring.EPC
                    })
                }
            } else {
                const { error } = await supabase.storage.from('certificaten').upload(`Asbest/${file.name}`, file)
                if (error) {
                    console.log('Could not upload Asbest certificate')
                } else {
                    keuringForm.asbest_certificaten.push({
                        naam: file.name,
                        size: file.size,
                        type: TypeKeuring.ASBEST
                    })
                }
            }
        }
    }
}

const removeDocument = async (event: Event, index: number) => {
    event.preventDefault()

    const { error } = await supabase.storage.from('extra-documenten').remove([`${keuringForm.extra_documenten[index].naam}`])
    if (error) {
        console.error(`Unable to remove ${keuringForm.extra_documenten[index].naam} from the storage`)
    } else {
        keuringForm.extra_documenten = keuringForm.extra_documenten.filter((document, i) => i !== index)
    }
}

const removeCertificaat = async (event: Event, index: number, typeKeuring: TypeKeuring) => {
    event.preventDefault()

    if (typeKeuring === TypeKeuring.EPC) {
        const { error } = await supabase.storage.from('certificaten').remove([`EPC/${keuringForm.epc_certificaten[index].naam}`])
        if (error) {
            console.error(`Unable to remove ${keuringForm.epc_certificaten[index].naam} from the storage`)
        } else {
            keuringForm.epc_certificaten = keuringForm.epc_certificaten.filter((certificaat, i) => i !== index)
        }
    } else {
        const { error } = await supabase.storage.from('certificaten').remove([`Asbest/${keuringForm.asbest_certificaten[index].naam}`])
        if (error) {
            console.error(`Unable to remove ${keuringForm.asbest_certificaten[index].naam} from the storage`)
        } else {
            keuringForm.asbest_certificaten = keuringForm.asbest_certificaten.filter((certificaat, i) => i !== index)
        }
    }
}

const uploadKlant = async (klant: Klant) => {
    const { data: uploadedKlant } = await supabase
        .from('klanten')
        .insert([
            {
                voornaam: klant.voornaam,
                achternaam: klant.achternaam,
                emailadres: klant.emailadres,
                telefoonnummer: klant.telefoonnummer
            }
        ])
        .select("id")
        .single()

    if (uploadedKlant) {
        return uploadedKlant.id
    }
}

const uploadAdres = async (adres: Adres) => {
    const gemeenteData = vlaamseStedenStore.getStadDataByGemeente(adres.vlaamse_stad.gemeente)
    const { data: uploadedAdres } = await supabase
        .from('adressen')
        .insert([
            {
                straatnaam: adres.straatnaam,
                nummer: adres.nummer,
                vlaamse_stad_ID: gemeenteData.id
            }
        ])
        .select('id')
        .single()

    if (uploadedAdres) {
        return uploadedAdres.id
    }
}

const uploadKeuring = async (keuring: Keuring) => {
    let klant = ""
    let adres = ""

    if (keuring.klant) {
        klant = await uploadKlant(keuring.klant)
    }

    if (keuring.adres) {
        adres = await uploadAdres(keuring.adres)
    }

    const { data: uploadedKeuring } = await supabase
        .from('keuringen')
        .insert([
            {
                adres_ID: adres,
                klant_ID: klant,
                status: keuring.status,
                type: keuring.type,
                opmerking: keuring.opmerking,
                created_by: keuring.created_by.id,
                toegang_eenheid: keuring.toegang_eenheid,
                datum_plaatsbezoek: keuring.datum_plaatsbezoek
            }
        ])
        .select('*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*))')
        .single()

    if (keuring.certificaten_epc) {
        const { data: uploadedEPCCertificaat } = await supabase
            .from('certificaten')
            .insert(
                keuring.certificaten_epc.map((cert) => ({
                    name: cert.naam,
                    size: cert.size,
                    type: cert.type,
                    keuringID: uploadedKeuring.id
                }))
            )
            .select()

        if (uploadedEPCCertificaat) {
            uploadedEPCCertificaat.map((cert) => {
                certificatenStore.addCertificaat({
                    naam: cert.name,
                    size: cert.size,
                    type: TypeKeuring.EPC
                })
            })
        } else {
            console.error('Could not store EPC Certificaat')
        }
    }

    if (keuring.certificaten_asbest) {
        const { data: uploadedAsbestCertificaat } = await supabase
            .from('certificaten')
            .insert(
                keuring.certificaten_asbest.map((cert) => ({
                    name: cert.naam,
                    size: cert.size,
                    type: cert.type,
                    keuringID: uploadedKeuring.id
                }))
            )
            .select()

        if (uploadedAsbestCertificaat) {
            uploadedAsbestCertificaat.map((cert) => {
                certificatenStore.addCertificaat({
                    naam: cert.name,
                    size: cert.size,
                    type: TypeKeuring.ASBEST
                })
            })
        } else {
            console.error('Could not store Asbest Certificaat')
        }
    }

    if (keuring.extra_documenten) {
        const { data: uploadedExtraDocument, error: errorExtraDoc } = await supabase.from('extra_documenten').insert(
            keuring.extra_documenten.map((extraDoc) => ({
                naam: extraDoc.naam,
                size: extraDoc.size,
                type: extraDoc.type,
                adres_ID: adres
            }))
        )
    }

    keuringenStore.addKeuring({
        id: uploadedKeuring.id,
        klant: {
            id: uploadedKeuring.klant.id,
            voornaam: uploadedKeuring.klant.voornaam,
            achternaam: uploadedKeuring.klant.achternaam,
            emailadres: uploadedKeuring.klant.emailadres,
            telefoonnummer: uploadedKeuring.klant.telefoonnummer
        },
        adres: {
            id: uploadedKeuring.adres.id,
            straatnaam: uploadedKeuring.adres.straatnaam,
            nummer: uploadedKeuring.adres.nummer,
            vlaamse_stad: uploadedKeuring.adres.vlaamse_stad
        },

        status: uploadedKeuring.status,
        type: uploadedKeuring.type,
        toegang_eenheid: uploadedKeuring.toegang_eenheid,
        datum_toewijzing: new Date(uploadedKeuring.created_at),
        datum_plaatsbezoek: new Date(uploadedKeuring.datum_plaatsbezoek),
        created_by: uploadedKeuring.created_by,
        opmerking: uploadedKeuring.opmerking,
        facturatie: null
    })

    router.push('/keuringen')
}

const handleChangeFacturatieBestemming = (event: any) => {
    event.preventDefault()

    if (keuringForm.facturatie.bestemming !== FacturatieBestemming.ANDERS) {
        keuringForm.facturatie.voornaam = ""
        keuringForm.facturatie.achternaam = ""
        keuringForm.facturatie.emailadres = ""
        keuringForm.facturatie.telefoonnummer = ""
        keuringForm.facturatie.straatnaam = ""
        keuringForm.facturatie.nummer = ""
        keuringForm.facturatie.vlaamse_stad = {
            gemeente: "",
            provincie: "",
            stad: ""
        }
    } else {
        copyClientData(keuringForm)
    }
}

const submitForm = (event: Event) => {
    event.preventDefault()

    if (keuringForm.type.length === 0) return

    const gemeenteData = vlaamseStedenStore.getStadDataByGemeente(keuringForm.vlaamse_stad.gemeente)

    const keuring: Keuring = {
        klant: {
            voornaam: keuringForm.voornaam,
            achternaam: keuringForm.familienaam,
            emailadres: keuringForm.emailadres,
            telefoonnummer: keuringForm.telefoonnummer
        },
        adres: {
            straatnaam: keuringForm.straatnaam,
            nummer: keuringForm.nummer,
            vlaamse_stad: {
                gemeente: gemeenteData.gemeente,
                stad: gemeenteData.stad,
                provincie: gemeenteData.provincie
            }
        },
        status: keuringForm.status,
        toegang_eenheid: keuringForm.toegang_eenheid,
        datum_toewijzing: new Date(Date.now()),
        datum_plaatsbezoek: keuringForm.datum_plaatsbezoek,
        opmerking: keuringForm.opmerking,
        certificaten_epc: keuringForm.epc_certificaten,
        certificaten_asbest: keuringForm.asbest_certificaten,
        extra_documenten: keuringForm.extra_documenten,
        type:
            keuringForm.type.includes(TypeKeuring.EPC) && keuringForm.type.includes(TypeKeuring.ASBEST)
                ? TypeKeuring.EPC_ASBEST
                : keuringForm.type.includes(TypeKeuring.EPC)
                    ? TypeKeuring.EPC
                    : TypeKeuring.ASBEST,
        created_by: keuringForm.created_by,
        facturatie: keuringForm.facturatie
    }

    console.log("upload keuring: ", keuring)
    uploadKeuring(keuring)
}

onBeforeMount(() => {
    getAdressenData()
})
</script>

<template>
    <div class="container add-keuring">
        <div class="title">
            <span class="back-btn" @click="router.back()">
                <Icon icon="mdi:arrow-left" width="30" />
            </span>
            <h1>Keuring toevoegen</h1>
        </div>

        <form class="content" @submit="submitForm">
            <div class="column">
                <div class="type">
                    <h2>Type</h2>
                    <div>
                        <span class="cb-epc">
                            <Checkbox v-model="keuringForm.type" inputId="tkEpc" :value="TypeKeuring.EPC" />
                            <label for="tkEpc" class="ml-2">{{ TypeKeuring.EPC }}</label>
                        </span>
                        <span class="cb-asbest">
                            <Checkbox v-model="keuringForm.type" inputId="tkAsbest" :value="TypeKeuring.ASBEST" />
                            <label for="tkAsbest" class="ml-2">{{ TypeKeuring.ASBEST }}</label>
                        </span>
                    </div>
                </div>
                <div class="klant">
                    <h2>Klant</h2>
                    <div>
                        <ul>
                            <li>
                                <Icon icon="mdi:account" width="24" />
                                <InputText type="text" v-model="keuringForm.voornaam" placeholder="Voornaam" required />
                            </li>
                            <li>
                                <Icon icon="" width="24" />
                                <InputText type="text" v-model="keuringForm.familienaam" placeholder="Familienaam"
                                    required />
                            </li>
                            <li>
                                <Icon icon="mdi:at" width="24" />
                                <InputText type="email" v-model="keuringForm.emailadres" placeholder="Emailadres"
                                    required />
                            </li>
                            <li>
                                <Icon icon="mdi:phone" width="24" />
                                <InputText type="tel" v-model="keuringForm.telefoonnummer" placeholder="Telefoonnummer"
                                    required pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}" />

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
                                <InputText type="text" v-model="keuringForm.straatnaam" placeholder="Straat" />
                                <InputText type="text" v-model="keuringForm.nummer" placeholder="Nr" maxlength="10"
                                    id="nummer" />

                            </li>
                            <li>
                                <Icon icon="mdi:city" width="24" />
                                <Dropdown resetFilterOnHide filter v-model="keuringForm.vlaamse_stad"
                                    :options="vlaamseStedenStore.vlaamse_steden.map((vlaamse_stad) => vlaamse_stad)"
                                    optionLabel="gemeente" placeholder="Gemeente" />
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
                                <label for="fac_hetzelfde" class="ml-2">Klant</label>
                            </span>
                            <span class="rb-immo">
                                <RadioButton v-model="keuringForm.facturatie.bestemming" inputId="fac_immo"
                                    :value="FacturatieBestemming.IMMO" @change="handleChangeFacturatieBestemming" />
                                <label for="fac_immo" class="ml-2">Immo</label>
                            </span>
                            <span class="rb-anders">
                                <RadioButton v-model="keuringForm.facturatie.bestemming" inputId="fac_anders"
                                    :value="FacturatieBestemming.ANDERS" @change="handleChangeFacturatieBestemming" />
                                <label for="fac_anders" class="ml-2">Anders</label>
                            </span>
                        </div>
                        <ul
                            v-if="keuringForm.facturatie.bestemming === FacturatieBestemming.ANDERS && keuringForm.facturatie">
                            <li>
                                <Icon icon="mdi:person" width="24" />

                                <InputText type="text" v-model="keuringForm.facturatie.voornaam" id="fac_voornaam"
                                    placeholder="Voornaam" required />
                            </li>
                            <li>
                                <Icon icon="" width="24" />
                                <InputText type="text" v-model="keuringForm.facturatie.achternaam" id="fac_familienaam"
                                    placeholder="Familienaam" required />
                            </li>
                            <li>
                                <Icon icon="mdi:at" width="24" />
                                <InputText type="email" v-model="keuringForm.facturatie.emailadres" id="fac_emailadres"
                                    placeholder="Emailadres" required />
                            </li>
                            <li>
                                <Icon icon="mdi:phone" width="24" />
                                <InputText type="tel" v-model="keuringForm.facturatie.telefoonnummer"
                                    id="fac_telefoonnummer" pattern="0*([1-9][0-9]*)(?:\s?\d{2}){3}"
                                    placeholder="Telefoonnummer" required />

                            </li>
                            <li>
                                <Icon icon="mdi:home" width="24" />
                                <InputText type="text" v-model="keuringForm.facturatie.straatnaam" id="fac_straatnaam"
                                    placeholder="Straat" required />
                                <InputText type="text" v-model="keuringForm.facturatie.nummer" id="fac_nummer"
                                    placeholder="Nr" maxlength="10" required />
                            </li>
                            <li v-if="keuringForm.facturatie.vlaamse_stad">
                                <Icon icon="mdi:city" width="24" />
                                <Dropdown resetFilterOnHide filter v-model="keuringForm.facturatie.vlaamse_stad"
                                    :options="vlaamseStedenStore.vlaamse_steden.map((vlaamse_stad) => vlaamse_stad)"
                                    optionLabel="gemeente" placeholder="Gemeente" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="column">
                <div class="certificaten" v-if="keuringForm.straatnaam && keuringForm.nummer">
                    <h2>Certificaten</h2>
                    <div class="epc-asbest">
                        <div class="epc" v-if="keuringForm.type.includes(TypeKeuring.EPC)">
                            <div class="uploader-wrapper">
                                <input class="hidden" type="file" name="epcCertificaat" id="epcCertificaat" multiple
                                    @change="($event) => uploadCertificaat($event, TypeKeuring.EPC)" accept=".pdf" />
                                <label for="epcCertificaat"> EPC Certificaat uploaden </label>
                                <ul v-if="keuringForm.epc_certificaten.length > 0">
                                    <li v-for="( certificaat, index ) in  keuringForm.epc_certificaten "
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
                                    <li v-for="( certificaat, index ) in  keuringForm.asbest_certificaten "
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
                </div>
                <div class="datum-plaatsbezoek">
                    <h2>Datum Plaatsbezoek</h2>
                    <div>
                        <VueDatePicker v-model="keuringForm.datum_plaatsbezoek" :min-date="new Date()"
                            preview-format="dd/MM/yyyy HH:mm" format="dd/MM/yyyy HH:mm" :min-time="{ hours: 7, minutes: 0 }"
                            :max-time="{ hours: 19, minutes: 0 }" locale="nl" cancel-text="Sluiten"
                            select-text="Selecteer" />
                    </div>
                </div>
                <div class="opmerking">
                    <h2>Opmerkingen</h2>
                    <div>
                        <Textarea v-model="keuringForm.opmerking" placeholder="Opmerkingen"></Textarea>
                    </div>
                </div>
                <div class="extradocs" v-if="keuringForm.straatnaam && keuringForm.nummer">
                    <h2>
                        Extra <br />
                        documenten
                    </h2>
                    <div class="uploader-wrapper">
                        <input class="hidden" type="file" name="extraDocumenten" id="extraDocumenten" multiple
                            @change="uploadExtraDocumenten" />
                        <label for="extraDocumenten"> Extra documenten uploaden </label>
                        <ul v-if="keuringForm.extra_documenten.length > 0">
                            <li v-for="( document, index ) in  keuringForm.extra_documenten " :key="document.naam">
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
                    <input type="submit" value="Toevoegen" class="confirm" />
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

.add-keuring {
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
                        margin: 0;

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
                }

                .gevonden-adressen {
                    margin-top: 2rem;

                    .gevonden-adres {
                        width: fit-content;
                        padding: 0.5rem 1rem;
                        border: 1px solid #000;
                        border-radius: 2rem;
                        cursor: pointer;
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

                    input {
                        margin: 0;
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

    :deep(.p-dropdown) {
        margin-left: 1rem;
    }

    :deep(.p-inputtext) {
        font-size: 1.4rem;

        &::placeholder {
            opacity: 1;
        }
    }

    :deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
        padding: 0.75rem 1.25rem;
    }
}
</style>
