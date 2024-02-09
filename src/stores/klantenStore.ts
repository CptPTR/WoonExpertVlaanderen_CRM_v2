import type { Klant } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useKlantenStore = defineStore('klanten', () => {
  const klanten: Ref<Klant[]> = ref([])

  const addKlant = (klant: Klant) => {
    klanten.value.push(klant)
  }

  const removeKlant = (id: string) => {
    klanten.value = klanten.value.filter((klant) => klant.id !== id)
  }

  const getKlant = (id: string) => {
    return klanten.value.find((klant) => klant.id === id)!
  }

  const empty = () => {
    klanten.value = []
  }

  return {
    klanten,
    addKlant,
    removeKlant,
    getKlant,
    empty
  }
})
