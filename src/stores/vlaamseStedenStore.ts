import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { VlaamseStad } from '../types'

export const useVlaamseStedenStore = defineStore('vlaamse_steden', () => {
  const vlaamse_steden: Ref<VlaamseStad[]> = ref([])

  const getStad = (id: string) => {
    return vlaamse_steden.value.find((vlaamse_stad) => vlaamse_stad.id === id)
  }

  const getStadDataByGemeente = (gemeente: string) => {
    return vlaamse_steden.value.find((vlaamse_stad) => vlaamse_stad.gemeente === gemeente)!
  }

  const addStad = (stad: VlaamseStad) => {
    vlaamse_steden.value.push(stad)
  }

  const empty = () => {
    vlaamse_steden.value = []
  }

  return { vlaamse_steden, addStad, getStad, getStadDataByGemeente, empty }
})
