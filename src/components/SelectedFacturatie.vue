<script setup lang="ts">
  import WEVEditFacturatie from '@/components/modals/WEVEditFacturatie.vue'
  import { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
  import { useFacturatiesStore } from '@/stores/facturatiesStore'
  import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
  import { Icon } from '@iconify/vue'
  import { computed, ref } from 'vue'

  const props = defineProps(['form'])

  const facturatiesStore = useFacturatiesStore()
  const vlaamseStedenStore = useVlaamseStedenStore()

  const openModal = ref<boolean>(false)

  const keuringFacturatieStad = computed(() => {
    if (keuringFacturatie.value) {
      const stad = vlaamseStedenStore.getStadById(keuringFacturatie.value.vlaamse_stad_ID)

      if (stad) {
        return `${stad.postcode} ${stad.gemeente}`
      }
    }
    return null
  })

  const keuringFacturatie = computed(() => {
    return facturatiesStore.facturaties.find((facturatie) => facturatie.id === props.form.facturatieID)
  })

  const handleClick = () => {
    openModal.value = !openModal.value
  }
</script>
<template>
  <div v-if="props.form.facturatie_bestemming === FacturatieBestemming.ANDERS && keuringFacturatie" class="container">
    <Icon icon="mdi:pencil" width="16" @click="handleClick" class="clickable" />
    <div class="content">
      <div class="fac_name text-sm">{{ `${keuringFacturatie.voornaam} ${keuringFacturatie.achternaam}` }}</div>
      <div class="fac_email-tel text-xs">
        {{ `${keuringFacturatie.emailadres} - ${keuringFacturatie.telefoonnummer.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` }}
      </div>
      <div class="fac_adres text-sm">
        {{ `${keuringFacturatie.straatnaam} ${keuringFacturatie.nummer}, ${keuringFacturatieStad}` }}
      </div>
    </div>
    <Teleport to="body">
      <WEVEditFacturatie :facturatie="keuringFacturatie" :open="openModal" @close-modal="handleClick" />
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
  .container {
    display: flex;
    gap: 1rem;
    padding-left: 0.25rem;
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  svg:hover {
    color: seagreen;
  }
</style>
