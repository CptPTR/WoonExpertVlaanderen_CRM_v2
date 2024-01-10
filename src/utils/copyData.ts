import type { FormKeuring } from '@/types'

export const copyClientData = (keuringForm: FormKeuring) => {
  if (!keuringForm.facturatie.voornaam) {
    keuringForm.facturatie.voornaam = keuringForm.voornaam
  }
  if (!keuringForm.facturatie.achternaam) {
    keuringForm.facturatie.achternaam = keuringForm.familienaam
  }
  if (!keuringForm.facturatie.emailadres) {
    keuringForm.facturatie.emailadres = keuringForm.emailadres
  }
  if (!keuringForm.facturatie.telefoonnummer) {
    keuringForm.facturatie.telefoonnummer = keuringForm.telefoonnummer
  }
  if (!keuringForm.facturatie.straatnaam) {
    keuringForm.facturatie.straatnaam = keuringForm.straatnaam
  }
  if (!keuringForm.facturatie.nummer) {
    keuringForm.facturatie.nummer = keuringForm.nummer
  }
  if (keuringForm.facturatie.vlaamse_stad) {
    keuringForm.facturatie.vlaamse_stad = keuringForm.vlaamse_stad
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
