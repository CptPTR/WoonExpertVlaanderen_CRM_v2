import type { Adres, FormKeuring, Klant } from '@/types'

export const copyClientData = (keuringForm: FormKeuring, klanten: Klant[]) => {
  const toCopyClient = klanten.find((klant) => klant.id === keuringForm.klantID)

  if (!keuringForm.facturatie.voornaam) {
    keuringForm.facturatie.voornaam = toCopyClient?.voornaam
  }
  if (!keuringForm.facturatie.achternaam) {
    keuringForm.facturatie.achternaam = toCopyClient?.achternaam
  }
  if (!keuringForm.facturatie.emailadres) {
    keuringForm.facturatie.emailadres = toCopyClient?.emailadres
  }
  if (!keuringForm.facturatie.telefoonnummer) {
    keuringForm.facturatie.telefoonnummer = toCopyClient?.telefoonnummer
  }
}

export const copyAddressData = (keuringForm: FormKeuring, adressen: Adres[]) => {
  const toCopyAddress = adressen.find((adres) => adres.id === keuringForm.adresID)

  if (!keuringForm.facturatie.straatnaam) {
    keuringForm.facturatie.straatnaam = toCopyAddress?.straatnaam
  }
  if (!keuringForm.facturatie.nummer) {
    keuringForm.facturatie.nummer = toCopyAddress?.nummer
  }
  if (keuringForm.facturatie.vlaamse_stad) {
    keuringForm.facturatie.vlaamse_stad = toCopyAddress?.vlaamse_stad
    // if (!keuringForm.facturatie.vlaamse_stad.gemeente) {
    //   keuringForm.facturatie.vlaamse_stad.gemeente = keuringForm.vlaamse_stad.gemeente
    // }
    // if (!keuringForm.facturatie.vlaamse_stad.stad) {
    //   keuringForm.facturatie.vlaamse_stad.stad = keuringForm.vlaamse_stad.stad
    // }
    // if (!keuringForm.facturatie.vlaamse_stad.provincie) {
    //   keuringForm.facturatie.vlaamse_stad.provincie = keuringForm.vlaamse_stad.provincie
    // }
  }
}
