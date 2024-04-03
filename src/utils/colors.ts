import { Status } from '@/enums/modules/Status'

export const getStatusColor = (status: Status) => {
  switch (status) {
    case Status.NIEUW:
      return '#FF0000'
    case Status.IN_BEHANDELING:
      return '#FFD700'
    case Status.INGEPLAND:
      return '#FFA500'
    case Status.CERTIFICAAT_BESCHIKBAAR:
      return '#008000'
  }
}

export const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'confirm':
      return 'seagreen'
    case 'error':
      return 'crimson'
  }
}
