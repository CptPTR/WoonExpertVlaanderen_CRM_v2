<script setup lang="ts">
  import AddressList from '@/components/AddressList.vue'
  import { supabase } from '@/config/supabase'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Adres, VlaamseStad } from '@/types'
  import { Icon } from '@iconify/vue'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'
  import InputWrapper from '@/components/form/InputWrapper.vue'

  const props = defineProps(['form'])
  const emits = defineEmits(['selectAddress', 'closeSubForm'])

  const authStore = useAuthStore()
  const vlaamseStedenStore = useVlaamseStedenStore()
  const adressenStore = useAdressenStore()

  const form = ref<Adres>({
    id: '',
    vlaamse_stad_ID: '0f060af7-b930-4f2a-84bc-72eeff632781',
    straatnaam: '',
    nummer: '',
    busnummer: '',
    created_by: '',
    ...props.form
  })

  const isAddressDuplicate = computed(() => {
    return (
      adressenStore.adressen.filter(
        (adres: Adres) =>
          adres.created_by === authStore.currentlyLoggedIn?.id &&
          adres.vlaamse_stad_ID === form.value.vlaamse_stad_ID &&
          adres.straatnaam.toLowerCase() === form.value.straatnaam.toLowerCase() &&
          adres.nummer === form.value.nummer &&
          adres.busnummer.toLowerCase() === form.value.busnummer.toLowerCase()
      ).length !== 0
    )
  })

  const addAddress = async () => {
    const { data: uploadedAddress } = await supabase
      .from('adressen')
      .insert([
        {
          straatnaam: form.value.straatnaam,
          nummer: form.value.nummer,
          busnummer: form.value.busnummer,
          vlaamse_stad_ID: form.value.vlaamse_stad_ID,
          created_by: authStore.currentlyLoggedIn?.id
        }
      ])
      .select('*, vlaamse_stad: vlaamse_steden(*)')

    if (uploadedAddress) {
      uploadedAddress.map((adres) => {
        emits('selectAddress', adres.id)
        adressenStore.addAdres({
          id: adres.id,
          straatnaam: adres.straatnaam,
          nummer: adres.nummer,
          busnummer: adres.busnummer,
          vlaamse_stad_ID: adres.vlaamse_stad_ID,
          created_by: adres.created_by
        })
      })
    }
  }
</script>

<template>
  <section class="adres-form-wrapper">
    <div class="top-bar">
      <h2 class="text-2xl">Adres</h2>
      <Icon icon="mdi:close" width="24" class="clickable" @click="emits('closeSubForm')" />
    </div>
    <div class="content">
      <div class="form">
        <Dropdown
          size="small"
          class="full-w"
          variant="filled"
          v-model="form.vlaamse_stad_ID"
          filter
          :options="vlaamseStedenStore.vlaamse_steden"
          :virtual-scroller-options="{ itemSize: 38 }"
          :optionLabel="(stad: VlaamseStad) => `${stad.gemeente} (${stad.postcode})`"
          optionValue="id"
          inputId="gemeente"
        >
          <template #option="slotProps">
            <div class="flex align-items-center">
              <div>{{ `${slotProps.option.gemeente} (${slotProps.option.postcode})` }}</div>
            </div>
          </template>
        </Dropdown>

        <InputWrapper label="Straatnaam" :showLabelFor="form.straatnaam">
          <InputText class="grid-item-2" size="small" type="text" v-model="form.straatnaam" id="straatnaam" placeholder="Straatnaam" variant="filled" />
        </InputWrapper>

        <InputWrapper label="Nummer" :showLabelFor="form.nummer">
          <InputText size="small" type="text" v-model="form.nummer" id="nummer" placeholder="Nummer" variant="filled" />
        </InputWrapper>

        <InputWrapper label="Busnummer" :showLabelFor="form.busnummer">
          <InputText size="small" type="text" v-model="form.busnummer" id="busnummer" placeholder="Busnummer" variant="filled" />
        </InputWrapper>

        <div class="acties">
          <Button type="button" size="small" severity="success" :disabled="isAddressDuplicate || !form.vlaamse_stad_ID || !form.straatnaam || !form.nummer" @click="addAddress">Toevoegen</Button>
        </div>
      </div>
      <AddressList @select-adres="(id: string) => $emit('selectAddress', id)" :formAdres="form" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .adres-form-wrapper {
    position: absolute;
    background-color: rgb(245, 245, 245);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 4rem;
    height: 600px;
    min-width: 800px;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    width: fit-content;
  }

  input {
    width: 100%;
    padding-block: 0.5rem;
    font-weight: bold;

    &::placeholder {
      font-weight: 300;
    }
  }

  .input-wrapper {
    position: relative;

    label {
      z-index: 20;
      color: grey;
      position: absolute;
      top: -8px;
      left: 5px;
      background-color: rgb(245, 245, 245);
      border-radius: 10px;
      padding-inline: 5px;
      line-height: 0.9rem;
      font-size: 0.6rem;
      color: seagreen;
      font-weight: bold;
    }

    .full-w {
      width: 100%;
    }
  }

  .content {
    display: flex;
    gap: 3rem;
    margin-top: 1rem;
  }

  .form {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    button {
      margin-top: 1rem;
    }
  }

  ul {
    flex: 3;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .p-dropdown {
        flex: 1;
      }
    }
  }

  :deep(.p-dropdown-label) {
    font-weight: bold;
  }
</style>
