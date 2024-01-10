import type { Gebruiker } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn: Ref<boolean> = ref(false)
  const currentlLoggedIn = ref<Gebruiker | null>()

  const setLoggedIn = (loggedIn: boolean) => {
    isLoggedIn.value = loggedIn
  }

  const setCurrentlyLoggedIn = (gebruiker: Gebruiker | null) => {
    currentlLoggedIn.value = gebruiker
  }

  return { isLoggedIn, setLoggedIn, currentlLoggedIn, setCurrentlyLoggedIn }
})
