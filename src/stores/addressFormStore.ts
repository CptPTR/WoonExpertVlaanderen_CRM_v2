import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

export const useAddressFormStore = defineStore('address-form', () => {
  const state = reactive({
    vlaamse_stad_ID: null,
    straatnaam: '',
    nummer: '',
    busnummer: ''
  })

  const resetForm = () => {
    state.vlaamse_stad_ID = null
    state.straatnaam = ''
    state.nummer = ''
    state.busnummer = ''
  }

  return {
    ...toRefs(state),
    resetForm
  }
})
