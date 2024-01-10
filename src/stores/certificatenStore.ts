import type { Certificaat } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useCertificaatStore = defineStore('certificaten', () => {
  const certificaten: Ref<Certificaat[]> = ref([])

  const addCertificaat = (certificaat: Certificaat) => {
    certificaten.value.push(certificaat)
  }

  const removeCertificaat = (id: string) => {
    certificaten.value = certificaten.value.filter((certificaat) => certificaat.id !== id)
  }

  const getCertificaat = (id: string) => {
    return certificaten.value.find((certificaat) => certificaat.id === id)
  }

  const empty = () => {
    certificaten.value = []
  }

  return { certificaten, addCertificaat, removeCertificaat, getCertificaat, empty }
})
