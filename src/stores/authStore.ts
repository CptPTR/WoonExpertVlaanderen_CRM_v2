import type { Gebruiker } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentlyLoggedIn = ref<Gebruiker | null>(null)

  const setCurrentlyLoggedIn = (gebruiker: Gebruiker | null) => {
    currentlyLoggedIn.value = gebruiker
  }

  return { currentlyLoggedIn, setCurrentlyLoggedIn }
})
