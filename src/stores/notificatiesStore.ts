import type { Notificatie } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useNotificatiesStore = defineStore('notificaties', () => {
  const notificaties: Ref<Notificatie[]> = ref([])

  const addNotificatie = (notificatie: Notificatie) => {
    notificaties.value.push(notificatie)
  }

  // const removeNotificatie = (title: string) => {
  //   notificaties.value = notificaties.value.filter((notificatie) => notificatie.title !== title)
  // }

  // const getNotificatie = (title: string) => {
  //   return notificaties.value.find((notificatie) => notificatie.title === title)!
  // }

  const empty = () => {
    notificaties.value = []
  }

  return {
    notificaties,
    addNotificatie,
    // removeNotificatie,
    // getNotificatie,
    empty
  }
})
