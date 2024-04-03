<script setup lang="ts">
  import AddressList from '@/components/AddressList.vue'
  import { supabase } from '@/config/supabase'
  import { useAdressenStore } from '@/stores/adressenStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import type { Adres, FormKeuring } from '@/types'
  import Dropdown from 'primevue/dropdown'
  import InputText from 'primevue/inputtext'
  import { computed, ref } from 'vue'

  const props = defineProps(['form'])
  const emits = defineEmits(['selectAddress'])

  const vlaamseStedenStore = useVlaamseStedenStore()
  const adressenStore = useAdressenStore()

  const form = ref<FormKeuring>(props.form)

  const isAddressDuplicate = computed(() => {
    return adressenStore.adressen.filter((adres: Adres) => adres.straatnaam === form.value.straatnaam && adres.nummer === form.value.nummer).length !== 0
  })

  const addAddress = async () => {
    const { data: uploadedAddress } = await supabase
      .from('adressen')
      .insert([
        {
          straatnaam: form.value.straatnaam,
          nummer: form.value.nummer,
          vlaamse_stad_ID: form.value.vlaamse_stad_ID
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
          vlaamse_stad_ID: adres.vlaamse_stad_ID
        })
      })
    }
  }
</script>

<template>
  <section class="adres">
    <h2>Adres</h2>
    <div class="content">
      <div class="form" style="width: 325px">
        <ul>
          <li>
            <Dropdown
              v-model="form.vlaamse_stad_ID"
              filter
              :options="vlaamseStedenStore.vlaamse_steden"
              :virtual-scroller-options="{ itemSize: 38 }"
              optionLabel="gemeente"
              optionValue="id"
              placeholder="Gemeente"
              inputId="gemeente"
            >
              <template #option="slotProps">
                <div class="flex align-items-center">
                  <div>{{ `${slotProps.option.gemeente} (${slotProps.option.postcode})` }}</div>
                </div>
              </template>
            </Dropdown>
          </li>
          <li v-if="form.vlaamse_stad_ID">
            <InputText type="text" v-model="form.straatnaam" placeholder="Straat" id="straatnaam" />
            <InputText type="text" v-model="form.nummer" placeholder="Nr" maxlength="20" id="nummer" />
          </li>
        </ul>
        <div class="acties">
          <input type="button" value="Toevoegen" class="confirm" @click="addAddress" :disabled="isAddressDuplicate || !form.straatnaam || !form.nummer" />
        </div>
      </div>
      <AddressList
        v-if="form.vlaamse_stad_ID"
        :selectedAdres="form.adresID"
        @select-adres="(id: string) => $emit('selectAddress', id)"
        :adressen="
          adressenStore.adressen.filter(
            (adres: Adres) =>
              `${adres.straatnaam.toLowerCase()} ${adres.nummer}`.includes(`${form.straatnaam.toLowerCase()}`) &&
              `${adres.straatnaam.toLowerCase()} ${adres.nummer}`.includes(`${form.nummer}`) &&
              adres.vlaamse_stad_ID === form.vlaamse_stad_ID
          )
        "
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .adres {
    font-size: 10px;
    flex: 1;
    padding: 4.5em;
    background-color: #fff;
    box-shadow:
      0 0 58px 0 rgba(0, 0, 0, 0.18),
      0 0 14px 0 rgba(0, 0, 0, 0.18);

    .content {
      display: flex;
      gap: 2.5em;
    }
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-block: 3em;

    li {
      display: flex;
      align-items: center;
      gap: 1em;

      .p-dropdown {
        flex: 1;
      }

      span {
        font-size: 1.2rem;
      }
    }

    input {
      padding: 0.75em;
      border: solid 1px rgb(226, 232, 240);
    }
  }

  .gevonden-adressen {
    margin-top: 2em;

    .gevonden-adres {
      width: fit-content;
      padding: 0.5em 1em;
      border: 1px solid #000;
      border-radius: 2em;
      cursor: pointer;
    }
  }

  input[id='straatnaam'] {
    flex: 1;
  }

  input[id='nummer'] {
    width: 100px;
    // flex: 1;
  }
</style>
