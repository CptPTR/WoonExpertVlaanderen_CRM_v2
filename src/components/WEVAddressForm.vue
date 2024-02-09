<script setup lang="ts">
import AddressList from "@/components/AddressList.vue";
import { supabase } from "@/config/supabase";
import { useAdressenStore } from "@/stores/adressenStore";
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore';
import type { Adres, FormKeuring } from '@/types';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';

const props = defineProps(["form"])
const emits = defineEmits(['selectAddress'])

const vlaamseStedenStore = useVlaamseStedenStore()
const adressenStore = useAdressenStore()

enum PROVINCIES {
    ANTWERPEN = "Antwerpen", VLAAMS_BRABANT = "Vlaams-Brabant"
}

const form = ref<FormKeuring>(props.form)
const provincie = ref<PROVINCIES>(PROVINCIES.ANTWERPEN)

const isAddressDuplicate = computed(() => {
    return adressenStore.adressen.filter((adres: Adres) =>
        adres.straatnaam === form.value.straatnaam &&
        adres.nummer === form.value.nummer &&
        adres.vlaamse_stad.gemeente === form.value.vlaamse_stad.gemeente
    ).length !== 0
})

const filteredGemeentenOpProvincies = computed(() => {
    return vlaamseStedenStore.vlaamse_steden.filter((stad) => stad.provincie === provincie.value)
})


const addAddress = async () => {
    const { data: uploadedAddress } = await supabase.from("adressen").insert([{
        'straatnaam': form.value.straatnaam,
        'nummer': form.value.nummer,
        'vlaamse_stad_ID': form.value.vlaamse_stad.id
    }]).select("*, vlaamse_stad: vlaamse_steden(*)")

    if (uploadedAddress) {
        uploadedAddress.map((adres) => {
            emits("selectAddress", adres.id)
            adressenStore.addAdres({
                id: adres.id,
                straatnaam: adres.straatnaam,
                nummer: adres.nummer,
                vlaamse_stad: {
                    id: adres.vlaamse_stad.id,
                    gemeente: adres.vlaamse_stad.gemeente,
                    stad: adres.vlaamse_stad.stad,
                    provincie: adres.vlaamse_stad.provincie,
                    postcode: adres.vlaamse_stad.postcode
                }
            })
        })
    }
}

const handleProvincieChange = () => {
    form.value.vlaamse_stad = {
        id: "",
        gemeente: "",
        stad: "",
        postcode: "",
        provincie: "",
    }
}

</script>

<template>
    <section class="adres">
        <h2>Adres</h2>
        <div class="content">
            <div class="form" style="width: 325px;">
                <ul>
                    <li>
                        <label for="dd-provincie">Provincie</label>
                        <Dropdown input-id="dd-provincie" v-model="provincie" :options="['Antwerpen', 'Vlaams Brabant']"
                            @change="handleProvincieChange" />
                    </li>
                    <li>
                        <Dropdown v-model="form.vlaamse_stad" filter auto-filter-focus
                            :options="filteredGemeentenOpProvincies" optionLabel="gemeente" placeholder="Gemeente"
                            inputId="gemeente">
                            <template #value="slotProps">
                                <div v-if="slotProps.value.gemeente" class="flex align-items-center">
                                    <div>{{ `${slotProps.value.gemeente} (${slotProps.value.postcode})` }}</div>
                                </div>
                                <div v-else>
                                    {{ slotProps.placeholder }}
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ `${slotProps.option.gemeente} (${slotProps.option.postcode})` }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </li>
                    <li v-if="form.vlaamse_stad.gemeente">
                        <InputText type="text" v-model="form.straatnaam" placeholder="Straat" id="straatnaam" />
                        <InputText type="text" v-model="form.nummer" placeholder="Nr" maxlength="20" id="nummer" />
                    </li>
                </ul>
                <div class="acties">
                    <input type="button" value="Toevoegen" class="confirm" @click="addAddress"
                        :disabled="isAddressDuplicate || !form.straatnaam || !form.nummer" />
                </div>
            </div>
            <AddressList v-if="form.vlaamse_stad.gemeente" :selectedAdres="form.adresID"
                @select-adres="(id) => $emit('selectAddress', id)"
                :adressen="adressenStore.adressen.filter((adres: Adres) => adres.vlaamse_stad.gemeente == form.vlaamse_stad.gemeente && adres.straatnaam.includes(form.straatnaam))" />
        </div>
    </section>
</template>

<style lang="scss" scoped>
.adres {
    flex: 1;
    padding: 4.5rem;
    background-color: #fff;
    box-shadow:
        0 0 58px 0 rgba(0, 0, 0, 0.18),
        0 0 14px 0 rgba(0, 0, 0, 0.18);

    .content {
        display: flex;
        gap: 2.5rem;
    }
}

ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-block: 3rem;


    li {
        display: flex;
        align-items: center;
        gap: 1rem;

        .p-dropdown {
            flex: 1;
        }
    }

    input {
        padding: 0.75rem;
        border: solid 1px rgb(226, 232, 240);
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

input[id='straatnaam'] {
    flex: 1
}

input[id='nummer'] {
    width: 100px;
    // flex: 1;
}
</style>