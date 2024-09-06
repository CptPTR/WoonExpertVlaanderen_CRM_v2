import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    EnvironmentPlugin(['APP_SUPABASE_URL', 'APP_ANON_KEY', 'FRONTEND_BASE_URL', 'BACKEND_BASE_URL', 'ADMIN_MAIL', 'DEFAULT_EPC', 'DEFAULT_ASBEST'])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
