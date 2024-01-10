import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useKeuringStore } from '@/stores/keuringenStore'
import { createRouter, createWebHistory, type NavigationGuard } from 'vue-router'
import KeuringAddView from '../views/KeuringAddView.vue'
import KeuringEditView from '../views/KeuringEditView.vue'
import KeuringenView from '../views/KeuringenView.vue'
import KeuringView from '../views/KeuringView.vue'
import LoginView from '../views/LoginView.vue'

const checkSession: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (to.name === 'login' && session) {
    // If trying to access login page while already logged in, redirect to home
    authStore.setLoggedIn(true)
    next('/')
  } else if (to.name !== 'login' && !session) {
    // If not logged in and trying to access a protected page, redirect to login
    authStore.setLoggedIn(false)
    next('/login')
  } else if (to.name === 'login' && !session) {
    // If trying to access login page while not logged in, proceed
    authStore.setLoggedIn(false)
    next()
  } else {
    // If logged in and accessing a page other than login, proceed
    authStore.setLoggedIn(true)
    next()
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
  const keuringStore = useKeuringStore()
  const authStore = useAuthStore()

  if (keuringStore.currentlyOpenedKeuring) {
    keuringStore.currentlyOpenedKeuring = null
  }

  if (!authStore.currentlLoggedIn) {
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
          }
        })
      }
    }
  }
})

export default router
