// import { Status } from '@/enums/modules/Status'
// import { ToegangEenheid } from '@/enums/modules/ToegangEenheid'
// import type { Keuring } from '@/types'
// import { TypeKeuring } from '../enums/modules/TypeKeuring'

// export const keuringenData: Array<Keuring> = [
//   {
//     id: '1',
//     klant: {
//       id: '1',
//       voornaam: 'Peter',
//       achternaam: 'De Clercq',
//       telefoonnummer: '0492316422',
//       emailadres: 'dclercqpeter@gmail.com'
//     },
//     adres: {
//       id: '1',
//       straatnaam: 'Populierenstraatnaam',
//       nummer: '4',
//       gemeente: 'Sint-Katelijne-Waver'
//     },
//     status: Status.NIEUW,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     type: TypeKeuring.EPC,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: null,
//     created_by: 'WoonExpertVlaanderen',
//     certificaat_epc: '1',
//     certificaat_asbest: '2',
//     opmerking: '170 EUR'
//   },
//   {
//     id: '2',
//     klant: {
//       id: '2',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '2',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     type: TypeKeuring.EPC_ASBEST,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '3',
//     klant: {
//       id: '3',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '3',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '4',
//     klant: {
//       id: '4',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '4',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     type: TypeKeuring.EPC,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '5',
//     klant: {
//       id: '5',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '5',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '6',
//     klant: {
//       id: '6',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '6',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '7',
//     klant: {
//       id: '7',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '7',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '8',
//     klant: {
//       id: '8',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '8',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '9',
//     klant: {
//       id: '9',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '9',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '10',
//     klant: {
//       id: '10',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '10',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '11',
//     klant: {
//       id: '11',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '11',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '12',
//     klant: {
//       id: '12',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '12',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '13',
//     klant: {
//       id: '13',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '13',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '14',
//     klant: {
//       id: '14',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '14',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '15',
//     klant: {
//       id: '15',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '15',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '16',
//     klant: {
//       id: '16',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '16',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '17',
//     klant: {
//       id: '17',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '17',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '18',
//     klant: {
//       id: '18',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '18',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '19',
//     klant: {
//       id: '19',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '19',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '20',
//     klant: {
//       id: '20',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '20',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '21',
//     klant: {
//       id: '21',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '21',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '22',
//     klant: {
//       id: '22',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '22',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '23',
//     klant: {
//       id: '23',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '23',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '24',
//     klant: {
//       id: '24',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '24',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '25',
//     klant: {
//       id: '25',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '25',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.IN_BEHANDELING,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '26',
//     klant: {
//       id: '26',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '26',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.KLANT,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   },
//   {
//     id: '27',
//     klant: {
//       id: '27',
//       voornaam: 'Helena',
//       achternaam: 'Dubois',
//       telefoonnummer: '0494557832',
//       emailadres: 'helena.dubois@outlook.com'
//     },
//     adres: {
//       id: '27',
//       straatnaam: 'Vlinderstraatnaam',
//       nummer: '34',
//       gemeente: 'Antwerpen'
//     },
//     status: Status.INGEPLAND,
//     toegang_eenheid: ToegangEenheid.SLEUTELS,
//     datum_aanwijzing: new Date(),
//     datum_plaatsbezoek: new Date(2023, 5, 25),
//     created_by: 'WoonExpertVlaanderen'
//   }
// ]
