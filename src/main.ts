import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(PrimeVue)
app.use(router)
app.use(pinia)

app.component('VueDatePicker', VueDatePicker)
app.mount('#app')
