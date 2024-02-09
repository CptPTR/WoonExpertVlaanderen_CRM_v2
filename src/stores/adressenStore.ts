import type { Adres } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAdressenStore = defineStore('adressen', () => {
  const adressen: Ref<Adres[]> = ref([])

  const addAdres = (adres: Adres) => {
    adressen.value.push(adres)
  }

  const removeAdres = (id: string) => {
    adressen.value = adressen.value.filter((adres) => adres.id !== id)
  }

  const getAdres = (id: string) => {
    return adressen.value.find((adres) => adres.id === id)!
  }

  const empty = () => {
    adressen.value = []
  }

  return {
    adressen,
    addAdres,
    removeAdres,
    getAdres,
    empty
  }
})
