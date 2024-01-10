import type { Keuring } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useKeuringStore = defineStore('keuringen', () => {
  const keuringen: Ref<Keuring[]> = ref([])
  const currentlyOpenedKeuring: Ref<string | null> = ref(null)

  const addKeuring = (keuring: Keuring) => {
    keuringen.value.push(keuring)
  }

  const addCurrentlyOpenedKeuring = (id: string) => {
    currentlyOpenedKeuring.value = id
  }

  const removeKeuring = (id: string) => {
    keuringen.value = keuringen.value.filter((keuring) => keuring.id !== id)
  }

  const getKeuring = (id: string) => {
    return keuringen.value.find((keuring) => keuring.id === id)!
  }

  const empty = () => {
    keuringen.value = []
  }

  return {
    keuringen,
    currentlyOpenedKeuring,
    addKeuring,
    addCurrentlyOpenedKeuring,
    removeKeuring,
    getKeuring,
    empty
  }
})
