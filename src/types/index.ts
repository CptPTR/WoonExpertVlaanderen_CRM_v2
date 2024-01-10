import type { FacturatieBestemming } from '@/enums/modules/FacturatieBestemming'
import type { Rol } from '@/enums/modules/Rol'
import type { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
import { Status } from '../enums/modules/Status'
import type { TypeKeuring } from '../enums/modules/TypeKeuring'

export type Klant = {
  id?: string
  voornaam: string
  achternaam: string
  telefoonnummer: string
  emailadres: string
}

export type Adres = {
  id?: string
  straatnaam: string
  nummer: string
  vlaamse_stad: VlaamseStad
}

export type VlaamseStad = {
  id?: string
  gemeente: string
  stad: string
  provincie: string
}

export type Keuring = {
  id?: string
  adres: Adres
  klant: Klant
  status: Status
  toegang_eenheid: ToegangEenheid
  type: TypeKeuring
  datum_toewijzing: Date
  datum_plaatsbezoek: Date | null
  created_by: Gebruiker
  certificaten_epc?: Certificaat[]
  certificaten_asbest?: Certificaat[]
  extra_documenten?: ExtraDocument[]
  opmerking: string
  facturatie: Facturatie | null
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
}

export type Organisatie = {
  id?: string
  naam: string
}

export type Facturatie = {
  id?: string
  voornaam?: string
  achternaam?: string
  emailadres?: string
  telefoonnummer?: string
  straatnaam?: string
  nummer?: string
  vlaamse_stad?: VlaamseStad
  bestemming: FacturatieBestemming
}

export type Certificaat = {
  id?: string
  naam: string
  type: string
  size: number
}

export type ExtraDocument = {
  id?: string
  naam: string
  size: number
  type: string
  adres?: Adres
}

export type FormKeuring = {
  type: TypeKeuring[]
  voornaam: string
  familienaam: string
  emailadres: string
  telefoonnummer: string

  adresID: string
  straatnaam: string
  nummer: string
  vlaamse_stad: {
    gemeente: string
    stad: string
    provincie: string
  }

  status: Status
  opmerking: string
  toegang_eenheid: ToegangEenheid
  datum_toewijzing?: Date
  datum_plaatsbezoek: Date | null
  epc_certificaten: Certificaat[]
  asbest_certificaten: Certificaat[]
  extra_documenten: ExtraDocument[]
  created_by: Gebruiker
  facturatie: Facturatie
}
