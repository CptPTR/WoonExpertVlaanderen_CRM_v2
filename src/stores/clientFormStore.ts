import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

export const useClientFormStore = defineStore('client-form', () => {
  const state = reactive({
    voornaam: '',
    familienaam: '',
    emailadres: '',
    telefoonnummer: ''
  })

  const resetForm = () => {
    state.voornaam = ''
    state.familienaam = ''
    state.emailadres = ''
    state.telefoonnummer = ''
  }

  return {
    ...toRefs(state),
    resetForm
  }
})
