import { supabase } from '@/config/supabase'
import { useAdressenStore } from '@/stores/adressenStore'
import { useAuthStore } from '@/stores/authStore'
import { useFacturatiesStore } from '@/stores/facturatiesStore'
import { useKeuringenStore } from '@/stores/keuringenStore'
import { useKlantenStore } from '@/stores/klantenStore'
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
import type { Adres, Facturatie, Klant } from '@/types'
import { createRouter, createWebHistory, type NavigationGuard } from 'vue-router'
import KeuringAddView from '../views/KeuringAddView.vue'
import KeuringEditView from '../views/KeuringEditView.vue'
import KeuringView from '../views/KeuringView.vue'
import KeuringenView from '../views/KeuringenView.vue'
import LoginView from '../views/LoginView.vue'

const checkSession: NavigationGuard = async (to, from, next) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (to.name === 'login' && session) {
    // If trying to access login page while already logged in, redirect to home
    next('/')
  } else if (to.name !== 'login' && !session) {
    // If not logged in and trying to access a protected page, redirect to login
    next('/login')
  } else if (to.name === 'login' && !session) {
    // If trying to access login page while not logged in, proceed
    next()
  } else {
    // If logged in and accessing a page other than login, proceed
    next()
  }
}

const getKeuringData = async () => {
  const keuringenStore = useKeuringenStore()

  const { data } = await supabase
    .from('keuringen')
    .select(
      '*, created_by: gebruikers(*, organisatie: organisaties(*)), klant: klanten(*), adres: adressen(*, vlaamse_stad: vlaamse_steden(*)), facturatie: facturaties(*, vlaamse_stad: vlaamse_steden(*))'
    )

  if (data) {
    data.map(async (keuring) => {
      keuringenStore.addKeuring({
        id: keuring.id,
        klant: {
          id: keuring.klant.id,
          voornaam: keuring.klant.voornaam,
          achternaam: keuring.klant.achternaam,
          emailadres: keuring.klant.emailadres,
          telefoonnummer: keuring.klant.telefoonnummer
        },
        adres: {
          id: keuring.adres.id,
          straatnaam: keuring.adres.straatnaam,
          nummer: keuring.adres.nummer,
          vlaamse_stad: keuring.adres.vlaamse_stad
        },
        facturatie: keuring.facturatie
          ? {
              id: keuring.facturatie.id,
              voornaam: keuring.facturatie.voornaam,
              achternaam: keuring.facturatie.achternaam,
              emailadres: keuring.facturatie.emailadres,
              telefoonnummer: keuring.facturatie.telefoonnummer,
              straatnaam: keuring.facturatie.straatnaam,
              nummer: keuring.facturatie.nummer,
              vlaamse_stad: keuring.facturatie.vlaamse_stad,
              organisatie: keuring.facturatie.organisatieID
            }
          : null,
        status: keuring.status,
        type: keuring.type,
        toegang_eenheid: keuring.toegang_eenheid,
        datum_toewijzing: new Date(keuring.created_at),
        datum_plaatsbezoek: keuring.datum_plaatsbezoek ? new Date(keuring.datum_plaatsbezoek) : null,
        created_by: keuring.created_by,
        opmerking: keuring.opmerking,
        facturatie_bestemming: keuring.facturatie_bestemming
      })

      // await getCertificatenData(keuring.id)
      // await getExtraDocumentenData(keuring.adres_ID)
    })
  }
}

const getAdressenData = async () => {
  const adressenStore = useAdressenStore()

  const { data } = await supabase.from('adressen').select('*, vlaamse_stad: vlaamse_steden(*)')

  if (data) {
    adressenStore.empty()
    data.map((adres: Adres) => {
      adressenStore.addAdres({
        id: adres.id,
        straatnaam: adres.straatnaam,
        nummer: adres.nummer,
        vlaamse_stad: {
          id: adres.vlaamse_stad.id,
          gemeente: adres.vlaamse_stad.gemeente,
          stad: adres.vlaamse_stad.stad,
          provincie: adres.vlaamse_stad.provincie,
          postcode: adres.vlaamse_stad.postcode
        }
      })
    })
  }
}

const getKlantenData = async () => {
  const klantenStore = useKlantenStore()

  const { data } = await supabase.from('klanten').select('*')

  if (data) {
    klantenStore.empty()
    data.map((klant: Klant) => {
      klantenStore.addKlant({
        id: klant.id,
        voornaam: klant.voornaam,
        achternaam: klant.achternaam,
        emailadres: klant.emailadres,
        telefoonnummer: klant.telefoonnummer
      })
    })
  }
}

const getFacturatiesData = async () => {
  const facturatiesStore = useFacturatiesStore()

  const { data } = await supabase.from('facturaties').select('*, organisatie: organisaties(*), vlaamse_stad: vlaamse_steden(*)')

  if (data) {
    facturatiesStore.empty()
    data.map((fac: Facturatie) => {
      facturatiesStore.addFacturatie({
        id: fac.id,
        voornaam: fac.voornaam,
        achternaam: fac.achternaam,
        emailadres: fac.emailadres,
        telefoonnummer: fac.telefoonnummer,
        straatnaam: fac.straatnaam,
        nummer: fac.nummer,
        vlaamse_stad: {
          id: fac.vlaamse_stad.id,
          gemeente: fac.vlaamse_stad.gemeente,
          stad: fac.vlaamse_stad.stad,
          provincie: fac.vlaamse_stad.provincie,
          postcode: fac.vlaamse_stad.postcode
        },
        organisatie: fac.organisatie
      })
    })
  }
}

const getLijstGemeenten = async () => {
  const vlaamseStedenStore = useVlaamseStedenStore()

  const { data } = await supabase.from('vlaamse_steden').select()

  if (data) {
    data.map((vlaamseStad) => {
      vlaamseStedenStore.addStad({
        id: vlaamseStad.id,
        gemeente: vlaamseStad.gemeente,
        stad: vlaamseStad.stad,
        provincie: vlaamseStad.provincie,
        postcode: vlaamseStad.postcode
      })
    })
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: checkSession
    },
    {
      path: '/',
      name: 'home',
      redirect: '/keuringen'
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/KeuringenView.vue')
    },
    {
      path: '/keuringen',
      name: 'keuringen',
      component: KeuringenView,
      beforeEnter: checkSession
    },
    {
      path: '/keuringen/:id',
      component: KeuringView,
      beforeEnter: checkSession
    },
    {
      path: '/keuringen/:id/edit',
      component: KeuringEditView,
      beforeEnter: checkSession
    },
    {
      path: '/keuringen/add',
      component: KeuringAddView,
      beforeEnter: checkSession
    }
  ]
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  if (to.path.startsWith('/keuringen')) {
    const keuringenStore = useKeuringenStore()
    const vlaamseStedenStore = useVlaamseStedenStore()
    const adressenStore = useAdressenStore()
    const klantenStore = useKlantenStore()
    const facturatieStore = useFacturatiesStore()

    if (!keuringenStore.keuringen.length) {
      await getKeuringData()
    }

    if (!vlaamseStedenStore.vlaamse_steden.length) {
      await getLijstGemeenten()
    }

    if (!adressenStore.adressen.length) {
      await getAdressenData()
    }

    if (!klantenStore.klanten.length) {
      await getKlantenData()
    }

    if (!facturatieStore.facturaties.length) {
      await getFacturatiesData()
    }
  }

  if (to.name === 'login' || authStore.currentlyLoggedIn) return

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    const { data: gebruikerData } = await supabase.from('gebruikers').select('*, organisatie: organisaties(naam)').eq('id', user.id).single()

    if (gebruikerData) {
      authStore.setCurrentlyLoggedIn({
        id: gebruikerData.id,
        voornaam: gebruikerData.voornaam,
        achternaam: gebruikerData.achternaam,
        email: gebruikerData.email,
        telefoonnummer: gebruikerData.telefoonnummer,
        rol: gebruikerData.rol,
        specialisatie: gebruikerData.specialisatie,
        organisatie: {
          naam: gebruikerData.organisatie.naam
        },
        avatar: gebruikerData.avatar
      })
    }
  }
})

export default router
