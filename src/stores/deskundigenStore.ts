import type { Gebruiker } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useDeskundigenStore = defineStore('deskundigen', () => {
  const deskundigen: Ref<Gebruiker[]> = ref([])

  const addDeskundige = (deskundige: Gebruiker) => {
    deskundigen.value.push(deskundige)
  }

  const removeDeskundige = (id: string) => {
    deskundigen.value = deskundigen.value.filter((deskundige) => deskundige.id !== id)
  }

  const getDeskundige = (id: string) => {
    return deskundigen.value.find((deskundige) => deskundige.id === id)!
  }

  const empty = () => {
    deskundigen.value = []
  }

  return {
    deskundigen,
    addDeskundige,
    removeDeskundige,
    getDeskundige,
    empty
  }
})
