import type { ExtraDocument } from '@/types'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useExtraDocumentStore = defineStore('extra_documenten', () => {
  const extra_documenten: Ref<ExtraDocument[]> = ref([])

  const addExtraDocument = (extraDocument: ExtraDocument) => {
    extra_documenten.value.push(extraDocument)
  }

  const removeExtraDocument = (name: string) => {
    extra_documenten.value = extra_documenten.value.filter((document) => document.naam !== name)
  }

  const getExtraDocument = (id: string) => {
    return extra_documenten.value.find((document) => document.id === id)
  }

  const getExtraDocumentByAdresId = (adresId: string) => {
    return extra_documenten.value.filter((document) => document.adresID === adresId)
  }

  const empty = () => {
    extra_documenten.value = []
  }

  return { extra_documenten, addExtraDocument, removeExtraDocument, getExtraDocument, getExtraDocumentByAdresId, empty }
})
