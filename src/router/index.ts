import { supabase } from '@/config/supabase'
import { useAdressenStore } from '@/stores/adressenStore'
import { useAuthStore } from '@/stores/authStore'
import { useDeskundigenStore } from '@/stores/deskundigenStore'
import { useFacturatiesStore } from '@/stores/facturatiesStore'
import { useKeuringenStore } from '@/stores/keuringenStore'
import { useKlantenStore } from '@/stores/klantenStore'
import { useVlaamseStedenStore } from '@/stores/vlaamseStedenStore'
import type { Adres, Facturatie, Klant } from '@/types'
import NotFoundView from '@/views/NotFoundView.vue'
import ResetPasswordRequestView from '@/views/ResetPasswordRequest.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
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

const getDeskundigenData = async () => {
  const deskundigenStore = useDeskundigenStore()

  const { data } = await supabase.from('gebruikers').select('*').eq('rol', 'deskundige')

  if (data) {
    data.map((deskundige) => {
      deskundigenStore.addDeskundige({
        id: deskundige.id,
        gebruikersnaam: deskundige.gebruikersnaam,
        voornaam: deskundige.voornaam,
        achternaam: deskundige.achternaam,
        email: deskundige.email,
        telefoonnummer: deskundige.telefoonnummer,
        avatar: deskundige.avatar,
        rol: deskundige.rol,
        specialisatie: deskundige.specialisatie,
        organisatie: deskundige.organisatieID
      })
    })
  }
}

const getKeuringData = async () => {
  const keuringenStore = useKeuringenStore()

  const { data } = await supabase.from('keuringen').select('*, created_by: gebruikers!keuringen_created_by_fkey(*, organisatie: organisaties(*))')

  if (data) {
    data.map(async (keuring) => {
      keuringenStore.addKeuring({
        id: keuring.id,
        klantID: keuring.klant_ID,
        adresID: keuring.adres_ID,
        facturatieID: keuring.facturatie_ID,
        status: keuring.status,
        type: keuring.type,
        toegang_eenheid: keuring.toegang_eenheid,
        datum_toewijzing: new Date(keuring.created_at),
        datum_plaatsbezoek: keuring.datum_plaatsbezoek ? new Date(keuring.datum_plaatsbezoek) : null,
        created_by: keuring.created_by,
        opmerking: keuring.opmerking,
        facturatie_bestemming: keuring.facturatie_bestemming,
        event_ID: keuring.event_ID,
        asbest_event_ID: keuring.asbest_event_ID,
        epc_toegewezen_aan: keuring.epc_toegewezen_aan,
        asbest_toegewezen_aan: keuring.asbest_toegewezen_aan
      })
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
        vlaamse_stad_ID: adres.vlaamse_stad_ID
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
        vlaamse_stad_ID: fac.vlaamse_stad_ID,
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
      path: '/reset-password-request',
      name: 'reset-password-request',
      component: ResetPasswordRequestView
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView
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
    },
    {
      path: '/404',
      name: '404',
      component: NotFoundView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.path.startsWith('/keuringen')) {
    const deskundigenStore = useDeskundigenStore()
    const keuringenStore = useKeuringenStore()
    const vlaamseStedenStore = useVlaamseStedenStore()
    const adressenStore = useAdressenStore()
    const klantenStore = useKlantenStore()
    const facturatieStore = useFacturatiesStore()

    if (!deskundigenStore.deskundigen.length) {
      await getDeskundigenData()
    }

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

  if (to.name === 'login' || to.name === 'reset-password-request' || to.name === 'reset-password' || authStore.currentlyLoggedIn) return

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    const { data: gebruikerData } = await supabase.from('gebruikers').select('*, organisatie: organisaties(naam)').eq('id', user.id).single()

    if (gebruikerData) {
      authStore.setCurrentlyLoggedIn({
        id: gebruikerData.id,
        gebruikersnaam: gebruikerData.gebruikersnaam,
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
