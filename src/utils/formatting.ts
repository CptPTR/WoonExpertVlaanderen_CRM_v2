export const formatFileSize = (bytes: number) => {
  const kilobyte = 1024
  const megabyte = kilobyte * 1024
  const gigabyte = megabyte * 1024

  if (bytes < kilobyte) {
    return bytes + ' B'
  } else if (bytes < megabyte) {
    return (bytes / kilobyte).toFixed(2) + ' KB'
  } else if (bytes < gigabyte) {
    return (bytes / megabyte).toFixed(2) + ' MB'
  } else {
    return (bytes / gigabyte).toFixed(2) + ' GB'
  }
}

export const formatDate = (dateToFormat: Date) => {
  const day = String(dateToFormat.getDate()).padStart(2, '0')
  const month = String(dateToFormat.getMonth() + 1).padStart(2, '0')
  const year = String(dateToFormat.getFullYear()).slice(-2)
  let hours = dateToFormat.getHours()
  const minutes = String(dateToFormat.getMinutes()).padStart(2, '0')
  const amOrPm = hours >= 12 ? 'NM' : 'VM'

  hours = hours % 12 || 12
  return `${day}/${month}/${year} ${hours}:${minutes} ${amOrPm}`
}
