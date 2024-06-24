import type { Facturatie } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useFacturatiesStore = defineStore('facturaties', () => {
  const facturaties: Ref<Facturatie[]> = ref([])

  const addFacturatie = (fac: Facturatie) => {
    facturaties.value.push(fac)
  }

  const editFacturatie = (index: string, facturatie: Facturatie) => {
    removeFacturatie(index)
    addFacturatie(facturatie)
  }

  const removeFacturatie = (id: string) => {
    facturaties.value = facturaties.value.filter((fac) => fac.id !== id)
  }

  const getFacturatie = (id: string) => {
    return facturaties.value.find((fac) => fac.id === id)!
  }

  const empty = () => {
    facturaties.value = []
  }

  return {
    facturaties,
    addFacturatie,
    editFacturatie,
    removeFacturatie,
    getFacturatie,
    empty
  }
})
