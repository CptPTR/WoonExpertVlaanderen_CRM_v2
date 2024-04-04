import type { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
import type { Rol } from '@/enums/modules/Rol'
import type { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
import { Status } from '../enums/modules/Status'
import type { TypeKeuring } from '../enums/modules/TypeKeuring'

export type Notificatie = {
  message: string
  type: string
}

export type Klant = {
  id?: string
  voornaam: string
  achternaam: string
  telefoonnummer: string
  emailadres: string
}

export type Adres = {
  id: string
  straatnaam: string
  nummer: string
  vlaamse_stad_ID: string
}

export type VlaamseStad = {
  id?: string
  gemeente: string
  stad: string
  provincie: string
  postcode: string
}

export type Keuring = {
  id?: string
  adresID: string
  klantID: string
  facturatieID: string | null
  facturatie_bestemming?: FacturatieBestemming
  status: Status
  toegang_eenheid: ToegangEenheid
  type: TypeKeuring
  datum_toewijzing: Date
  datum_plaatsbezoek: Date | null
  created_by: Gebruiker
  certificaten_epc?: Certificaat[]
  certificaten_asbest?: Certificaat[]
  extra_documenten?: ExtraDocument[]
  opmerking: string,
  event_ID: string | null,
  asbest_event_ID: string | null
}

export type Gebruiker = {
  id?: string
  voornaam: string
  achternaam: string
  email: string
  telefoonnummer: string
  specialisatie: TypeKeuring
  rol: Rol
  organisatie: Organisatie
  avatar: string
}

export type Organisatie = {
  id?: string
  naam: string
}

export type Facturatie = {
  id?: string
  voornaam: string
  achternaam: string
  emailadres: string
  telefoonnummer: string
  straatnaam: string
  nummer: string
  vlaamse_stad_ID: string
  organisatie?: string | null
}

export type Certificaat = {
  id?: string
  naam: string
  type: string
  size: number
  keuringID: string
}

export type ExtraDocument = {
  id?: string
  naam: string
  size: number
  type: string
  adresID: string
}

export type FormKeuring = {
  type: TypeKeuring[]
  voornaam: string
  familienaam: string
  emailadres: string
  telefoonnummer: string

  adresID: string
  klantID: string
  facturatieID: string | null
  facturatie_bestemming: FacturatieBestemming

  straatnaam: string
  nummer: string
  vlaamse_stad_ID: string

  status: Status
  opmerking: string
  toegang_eenheid: ToegangEenheid
  datum_toewijzing?: Date
  datum_plaatsbezoek: Date | null
  epc_certificaten: Certificaat[]
  asbest_certificaten: Certificaat[]
  extra_documenten: ExtraDocument[]
  created_by: Gebruiker
  event_ID: string | null
  asbest_event_ID: string | null
}
